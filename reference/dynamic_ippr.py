"""PiRC-101 market-tick IPPR and reflexive QWF reference model.

IPPR is re-based on every accepted market tick:
    IPPR = median(PI/USD) * 10_000_000
QWF is a separate adaptive state, never the IPPR multiplier.
Reflexive constraint:
    Phi = (L_n * IPPR) / QWF

All external prices use integer nano-USD per PI; velocity is integer ppm.
This is a reference model, not a wallet, issuance, redemption, or settlement rail.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

PRICE_SCALE = 1_000_000_000  # nano-USD per USD
VELOCITY_SCALE = 1_000_000   # ppm per unit velocity
IPPR_SUPPLY_MULTIPLIER = 10_000_000


class IPPRValidationError(ValueError):
    """Raised when an oracle snapshot or economic gate input is unsafe."""


@dataclass(frozen=True)
class PriceObservation:
    venue_id: str
    price_nano_usd_per_pi: int
    observed_at: int


@dataclass(frozen=True)
class OraclePolicy:
    min_sources: int = 3
    max_age_seconds: int = 120
    max_deviation_bps: int = 1_500


@dataclass(frozen=True)
class OracleResult:
    median_price_nano_usd_per_pi: int
    source_count: int
    observed_at: int
    max_deviation_bps: int


@dataclass(frozen=True)
class EconomicGates:
    active_merchants: int
    available_listings: int
    fulfilled_orders_window: int
    settled_volume_nano_usd: int
    average_supply_atomic: int
    liquid_depth_nano_usd: int
    minimum_liquid_depth_nano_usd: int
    eligible_reserves_nano_usd: int
    outstanding_ref_liability_nano_usd: int


@dataclass(frozen=True)
class GateResult:
    oracle_gate: bool
    utility_gate: bool
    velocity_liquidity_gate: bool
    solvency_gate: bool | None

    @property
    def all_passed(self) -> bool:
        return all(value is True for value in (
            self.oracle_gate, self.utility_gate,
            self.velocity_liquidity_gate, self.solvency_gate,
        ))


@dataclass(frozen=True)
class IPPRResult:
    external_price_nano_usd_per_pi: int
    ippr_supply_multiplier: int
    ippr_nano_usd_per_pi: int
    qwf_current: int
    network_velocity_ppm: int
    phi_ppm: int
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
        _nonnegative_int(f"price[{i}]", obs.price_nano_usd_per_pi)
        _nonnegative_int(f"observed_at[{i}]", obs.observed_at)
        if obs.price_nano_usd_per_pi == 0:
            raise IPPRValidationError("oracle price must be positive")
        if obs.observed_at > now_ts:
            raise IPPRValidationError("future-dated oracle observation")
        if now_ts - obs.observed_at > policy.max_age_seconds:
            raise IPPRValidationError("stale oracle observation")
    if len(observations) < policy.min_sources:
        raise IPPRValidationError("oracle quorum not met")
    median = median_int([o.price_nano_usd_per_pi for o in observations])
    max_dev = max(
        (abs(o.price_nano_usd_per_pi - median) * 10_000) // median
        for o in observations
    )
    if max_dev > policy.max_deviation_bps:
        raise IPPRValidationError("oracle deviation circuit breaker")
    return OracleResult(
        median_price_nano_usd_per_pi=median,
        source_count=len(observations),
        observed_at=min(o.observed_at for o in observations),
        max_deviation_bps=max_dev,
    )


def evaluate_gates(g: EconomicGates) -> GateResult:
    for name, value in g.__dict__.items():
        _nonnegative_int(name, value)
    utility_gate = (
        g.active_merchants > 0
        and g.available_listings > 0
        and g.fulfilled_orders_window > 0
    )
    velocity_liquidity_gate = (
        g.settled_volume_nano_usd > 0
        and g.average_supply_atomic > 0
        and g.liquid_depth_nano_usd >= g.minimum_liquid_depth_nano_usd
        and g.minimum_liquid_depth_nano_usd > 0
    )
    solvency_gate = (
        None if g.outstanding_ref_liability_nano_usd == 0
        else g.eligible_reserves_nano_usd >= g.outstanding_ref_liability_nano_usd
    )
    return GateResult(True, utility_gate, velocity_liquidity_gate, solvency_gate)


def calculate_ippr(
    observations: Sequence[PriceObservation],
    now_ts: int,
    gates: EconomicGates,
    qwf_current: int,
    network_velocity_ppm: int,
    oracle_policy: OraclePolicy = OraclePolicy(),
) -> IPPRResult:
    """Re-base IPPR on each accepted tick; calculate Phi with independent QWF."""
    _nonnegative_int("qwf_current", qwf_current)
    _nonnegative_int("network_velocity_ppm", network_velocity_ppm)
    if qwf_current == 0:
        raise IPPRValidationError("qwf_current must be positive")
    if network_velocity_ppm > 100_000_000:
        raise IPPRValidationError("network velocity exceeds the supported safety bound")
    oracle = aggregate_oracle(observations, now_ts, oracle_policy)
    gate_result = evaluate_gates(gates)
    ippr = oracle.median_price_nano_usd_per_pi * IPPR_SUPPLY_MULTIPLIER
    # Phi_ppm = (L_n * IPPR / QWF) * 1e6, preserving fixed-point precision.
    phi_ppm = (
        network_velocity_ppm * ippr
        // (PRICE_SCALE * qwf_current)
    )
    status = "REFERENCE_ONLY_GATES_PASSED" if gate_result.all_passed else "REFERENCE_ONLY_GATED"
    return IPPRResult(
        external_price_nano_usd_per_pi=oracle.median_price_nano_usd_per_pi,
        ippr_supply_multiplier=IPPR_SUPPLY_MULTIPLIER,
        ippr_nano_usd_per_pi=ippr,
        qwf_current=qwf_current,
        network_velocity_ppm=network_velocity_ppm,
        phi_ppm=phi_ppm,
        oracle=oracle,
        gates=gate_result,
        status=status,
    )
