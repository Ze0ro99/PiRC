"""Deterministic Testnet/reference controller for a market-linked IPPR index.

This module computes an informational internal reference index from a validated
multi-venue Pi/USD observation. It does not create a redeemable balance, REF
liability, collateral claim, wallet conversion, or payment authorization.

All prices are integer micro-USD per PI; ratios use basis points. No floats.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence


class IPPRValidationError(ValueError):
    """Raised when an oracle snapshot or economic gate input is unsafe."""


@dataclass(frozen=True)
class PriceObservation:
    venue_id: str
    price_micro_usd_per_pi: int
    observed_at: int


@dataclass(frozen=True)
class OraclePolicy:
    min_sources: int = 3
    max_age_seconds: int = 120
    max_deviation_bps: int = 1_500


@dataclass(frozen=True)
class OracleResult:
    median_price_micro_usd_per_pi: int
    source_count: int
    observed_at: int
    max_deviation_bps: int


@dataclass(frozen=True)
class EconomicGates:
    # Gate 2: verifiable utility supply and completed commerce.
    active_merchants: int
    available_listings: int
    fulfilled_orders_window: int
    # Gate 3: real settled activity and accessible same-window liquidity.
    settled_volume_micro_usd: int
    average_supply_atomic: int
    liquid_depth_micro_usd: int
    minimum_liquid_depth_micro_usd: int
    # Gate 4: independently eligible collateral/reserves vs issued liability.
    eligible_reserves_micro_usd: int
    outstanding_ref_liability_micro_usd: int


@dataclass(frozen=True)
class GateResult:
    oracle_gate: bool
    utility_gate: bool
    velocity_liquidity_gate: bool
    solvency_gate: bool

    @property
    def all_passed(self) -> bool:
        return all((self.oracle_gate, self.utility_gate,
                    self.velocity_liquidity_gate, self.solvency_gate))


@dataclass(frozen=True)
class IPPRResult:
    external_price_micro_usd_per_pi: int
    qwf_multiplier: int
    raw_ippr_micro_usd_per_pi: int
    guardrail_bps: int
    guarded_reference_micro_usd_per_pi: int
    oracle: OracleResult
    gates: GateResult
    status: str


def _nonnegative_int(name: str, value: int) -> None:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise IPPRValidationError(f"{name} must be a non-negative integer")


def median_int(values: Sequence[int]) -> int:
    if not values:
        raise IPPRValidationError("at least one value is required")
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[middle]
    # Deterministic integer midpoint; floor is the specified rounding rule.
    return (ordered[middle - 1] + ordered[middle]) // 2


def aggregate_oracle(
    observations: Sequence[PriceObservation],
    now_ts: int,
    policy: OraclePolicy = OraclePolicy(),
) -> OracleResult:
    _nonnegative_int("now_ts", now_ts)
    if policy.min_sources < 3 or policy.max_age_seconds <= 0:
        raise IPPRValidationError("oracle policy requires >=3 sources and positive freshness")
    if not observations:
        raise IPPRValidationError("oracle observations are required")
    venues = [o.venue_id.strip() for o in observations]
    if any(not v for v in venues) or len(set(venues)) != len(venues):
        raise IPPRValidationError("oracle venues must be non-empty and independent")
    for i, obs in enumerate(observations):
        _nonnegative_int(f"price[{i}]", obs.price_micro_usd_per_pi)
        _nonnegative_int(f"observed_at[{i}]", obs.observed_at)
        if obs.price_micro_usd_per_pi == 0:
            raise IPPRValidationError("oracle price must be positive")
        if obs.observed_at > now_ts:
            raise IPPRValidationError("future-dated oracle observation")
        if now_ts - obs.observed_at > policy.max_age_seconds:
            raise IPPRValidationError("stale oracle observation")
    if len(observations) < policy.min_sources:
        raise IPPRValidationError("oracle quorum not met")
    median = median_int([o.price_micro_usd_per_pi for o in observations])
    max_dev = max(
        (abs(o.price_micro_usd_per_pi - median) * 10_000) // median
        for o in observations
    )
    if max_dev > policy.max_deviation_bps:
        raise IPPRValidationError("oracle deviation circuit breaker")
    return OracleResult(
        median_price_micro_usd_per_pi=median,
        source_count=len(observations),
        observed_at=min(o.observed_at for o in observations),
        max_deviation_bps=max_dev,
    )


def evaluate_gates(g: EconomicGates) -> GateResult:
    for name, value in g.__dict__.items():
        _nonnegative_int(name, value)
    oracle_gate = True  # Set only after aggregate_oracle has succeeded.
    utility_gate = (
        g.active_merchants > 0
        and g.available_listings > 0
        and g.fulfilled_orders_window > 0
    )
    velocity_liquidity_gate = (
        g.settled_volume_micro_usd > 0
        and g.average_supply_atomic > 0
        and g.liquid_depth_micro_usd >= g.minimum_liquid_depth_micro_usd
        and g.minimum_liquid_depth_micro_usd > 0
    )
    # A zero liability is NOT_APPLICABLE, not an infinite coverage ratio.
    solvency_gate = (
        g.outstanding_ref_liability_micro_usd == 0
        or g.eligible_reserves_micro_usd >= g.outstanding_ref_liability_micro_usd
    )
    return GateResult(oracle_gate, utility_gate, velocity_liquidity_gate, solvency_gate)


def calculate_ippr(
    observations: Sequence[PriceObservation],
    now_ts: int,
    gates: EconomicGates,
    qwf_multiplier: int = 10_000_000,
    guardrail_bps: int = 10_000,
    oracle_policy: OraclePolicy = OraclePolicy(),
) -> IPPRResult:
    """Calculate the live market-linked reference; guardrails never mint or settle."""
    _nonnegative_int("qwf_multiplier", qwf_multiplier)
    _nonnegative_int("guardrail_bps", guardrail_bps)
    if qwf_multiplier == 0 or guardrail_bps > 10_000:
        raise IPPRValidationError("invalid QWF multiplier or guardrail")
    oracle = aggregate_oracle(observations, now_ts, oracle_policy)
    gate_result = evaluate_gates(gates)
    raw = oracle.median_price_micro_usd_per_pi * qwf_multiplier
    guarded = (raw * guardrail_bps) // 10_000
    status = "REFERENCE_ONLY_GATES_PASSED" if gate_result.all_passed else "REFERENCE_ONLY_GATED"
    return IPPRResult(
        external_price_micro_usd_per_pi=oracle.median_price_micro_usd_per_pi,
        qwf_multiplier=qwf_multiplier,
        raw_ippr_micro_usd_per_pi=raw,
        guardrail_bps=guardrail_bps,
        guarded_reference_micro_usd_per_pi=guarded,
        oracle=oracle,
        gates=gate_result,
        status=status,
    )
