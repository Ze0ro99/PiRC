"""Deterministic reference engine for revenue-funded allocations.

Amounts are non-negative integer atomic units in a single explicitly declared asset.
This module is a reference model, not a wallet, oracle, chain client, or production
financial service. It uses only the Python standard library.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Mapping


class EconomicInvariantError(ValueError):
    """Raised when an input would violate a declared accounting invariant."""


@dataclass(frozen=True)
class PeriodLedger:
    period_id: str
    asset_id: str
    collected_revenue: int
    operating_costs: int
    taxes_and_statutory_obligations: int
    due_liabilities_and_refunds: int
    reserve_replenishment: int
    committed_distributions_and_capex: int

    def __post_init__(self) -> None:
        if not self.period_id.strip() or not self.asset_id.strip():
            raise EconomicInvariantError("period_id and asset_id are required")
        for name, value in self.__dict__.items():
            if name in {"period_id", "asset_id"}:
                continue
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                raise EconomicInvariantError(f"{name} must be a non-negative integer atomic amount")

    @property
    def distributable(self) -> int:
        """Collected revenue less every senior obligation; never silently clamp losses."""
        deductions = (
            self.operating_costs
            + self.taxes_and_statutory_obligations
            + self.due_liabilities_and_refunds
            + self.reserve_replenishment
            + self.committed_distributions_and_capex
        )
        if deductions > self.collected_revenue:
            raise EconomicInvariantError("period is underfunded: distributable resources are negative")
        return self.collected_revenue - deductions


@dataclass(frozen=True)
class Allocation:
    amounts: Mapping[str, int]
    total: int


def allocate_largest_remainder(total: int, weights: Mapping[str, int]) -> Allocation:
    """Allocate exactly total units using integer arithmetic and stable ID tie-breaks.

    The mapping keys are stable participant identifiers. Equal remainders are awarded
    in lexicographic participant-ID order so every implementation reproduces the result.
    """
    if isinstance(total, bool) or not isinstance(total, int) or total < 0:
        raise EconomicInvariantError("total must be a non-negative integer")
    if not weights:
        if total == 0:
            return Allocation({}, 0)
        raise EconomicInvariantError("cannot allocate a positive total to an empty participant set")
    normalized: dict[str, int] = {}
    for participant_id, weight in weights.items():
        if not isinstance(participant_id, str) or not participant_id.strip():
            raise EconomicInvariantError("participant IDs must be non-empty strings")
        if isinstance(weight, bool) or not isinstance(weight, int) or weight < 0:
            raise EconomicInvariantError(f"weight for {participant_id!r} must be a non-negative integer")
        normalized[participant_id] = weight
    weight_sum = sum(normalized.values())
    if weight_sum <= 0:
        if total == 0:
            return Allocation({key: 0 for key in sorted(normalized)}, 0)
        raise EconomicInvariantError("sum of weights must be positive for a positive allocation")

    base: dict[str, int] = {}
    remainders: list[tuple[int, str]] = []
    allocated = 0
    for participant_id in sorted(normalized):
        numerator = total * normalized[participant_id]
        amount, remainder = divmod(numerator, weight_sum)
        base[participant_id] = amount
        allocated += amount
        remainders.append((remainder, participant_id))

    remaining = total - allocated
    # Largest remainder first; stable ascending ID resolves ties.
    ranked = sorted(remainders, key=lambda item: (-item[0], item[1]))
    for _, participant_id in ranked[:remaining]:
        base[participant_id] += 1
    if sum(base.values()) != total:
        raise AssertionError("allocation conservation invariant failed")
    return Allocation(base, total)


def reserve_coverage_bps(eligible_reserves: int, redeemable_liabilities: int) -> int | None:
    """Return reserve coverage in basis points; None means NOT_APPLICABLE (0 liabilities)."""
    for name, value in (("eligible_reserves", eligible_reserves), ("redeemable_liabilities", redeemable_liabilities)):
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise EconomicInvariantError(f"{name} must be a non-negative integer atomic amount")
    if redeemable_liabilities == 0:
        return None
    return (eligible_reserves * 10_000) // redeemable_liabilities


def supply_growth_bps(previous_supply: int, current_supply: int) -> int | None:
    """Return signed supply growth in basis points; None when prior supply is zero."""
    for name, value in (("previous_supply", previous_supply), ("current_supply", current_supply)):
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise EconomicInvariantError(f"{name} must be a non-negative integer")
    if previous_supply == 0:
        return None
    delta = current_supply - previous_supply
    # Truncation is toward zero, specified explicitly for deterministic signed rates.
    numerator = delta * 10_000
    return numerator // previous_supply if numerator >= 0 else -((-numerator) // previous_supply)


def settle_period(ledger: PeriodLedger, eligible_weights: Mapping[str, int]) -> Allocation:
    """Return a deterministic distribution that cannot exceed net collected resources."""
    distributable = ledger.distributable
    # Validate participant IDs and weights even when the payable total is zero.
    return allocate_largest_remainder(distributable, eligible_weights)
