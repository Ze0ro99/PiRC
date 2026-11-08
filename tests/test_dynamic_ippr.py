import unittest

from reference.dynamic_ippr import (
    EconomicGates,
    IPPRValidationError,
    OraclePolicy,
    PriceObservation,
    aggregate_oracle,
    calculate_ippr,
    median_int,
)


def observations(prices=(31_415_900, 31_416_000, 31_415_800), age=10):
    return [
        PriceObservation(f"venue-{i}", price, 1_000 - age)
        for i, price in enumerate(prices)
    ]


def passing_gates():
    return EconomicGates(
        active_merchants=4,
        available_listings=20,
        fulfilled_orders_window=15,
        settled_volume_nano_usd=5_000_000,
        average_supply_atomic=10_000_000,
        liquid_depth_nano_usd=2_000_000,
        minimum_liquid_depth_nano_usd=1_000_000,
        eligible_reserves_nano_usd=1_000_000,
        outstanding_ref_liability_nano_usd=500_000,
    )


class DynamicIPPRTests(unittest.TestCase):
    def test_live_price_times_ten_million(self):
        result = calculate_ippr(observations(), 1_000, passing_gates())
        self.assertEqual(result.external_price_nano_usd_per_pi, 31_415_900)
        self.assertEqual(result.raw_ippr_nano_usd_per_pi, 314_159_000_000_000)
        self.assertEqual(result.guarded_reference_nano_usd_per_pi, 314_159_000_000_000)
        self.assertEqual(result.status, "REFERENCE_ONLY_GATES_PASSED")

    def test_index_tracks_market_price_not_fixed_constant(self):
        low = calculate_ippr(observations((10_000_000, 10_000_000, 10_000_000)), 1_000, passing_gates())
        high = calculate_ippr(observations((20_000_000, 20_000_000, 20_000_000)), 1_000, passing_gates())
        self.assertEqual(high.raw_ippr_nano_usd_per_pi, low.raw_ippr_nano_usd_per_pi * 2)

    def test_guardrail_reduces_reference_not_market_quote(self):
        result = calculate_ippr(observations(), 1_000, passing_gates(), guardrail_bps=5_000)
        self.assertEqual(result.external_price_nano_usd_per_pi, 31_415_900)
        self.assertEqual(result.guarded_reference_nano_usd_per_pi, result.raw_ippr_nano_usd_per_pi // 2)

    def test_oracle_requires_three_independent_venues(self):
        with self.assertRaisesRegex(IPPRValidationError, "quorum"):
            aggregate_oracle(observations((100_000, 101_000)) , 1_000)

    def test_oracle_rejects_duplicate_venue(self):
        obs = observations()
        obs[1] = PriceObservation(obs[0].venue_id, obs[1].price_nano_usd_per_pi, obs[1].observed_at)
        with self.assertRaisesRegex(IPPRValidationError, "independent"):
            aggregate_oracle(obs, 1_000)

    def test_oracle_rejects_stale_or_future_quotes(self):
        with self.assertRaisesRegex(IPPRValidationError, "stale"):
            aggregate_oracle(observations(age=121), 1_000)
        future = [PriceObservation(f"v{i}", 31_415_900, 1_001) for i in range(3)]
        with self.assertRaisesRegex(IPPRValidationError, "future"):
            aggregate_oracle(future, 1_000)

    def test_oracle_deviation_circuit_breaker(self):
        with self.assertRaisesRegex(IPPRValidationError, "deviation"):
            aggregate_oracle(observations((31_415_900, 31_415_900, 62_831_800)), 1_000)

    def test_fourth_gate_blocks_under_collateralized_liability(self):
        g = passing_gates()
        g = EconomicGates(**{**g.__dict__, "eligible_reserves_nano_usd": 10})
        result = calculate_ippr(observations(), 1_000, g)
        self.assertFalse(result.gates.solvency_gate)
        self.assertEqual(result.status, "REFERENCE_ONLY_GATED")

    def test_utility_and_velocity_gates_are_required(self):
        g = EconomicGates(**{
            **passing_gates().__dict__,
            "active_merchants": 0,
            "settled_volume_nano_usd": 0,
        })
        result = calculate_ippr(observations(), 1_000, g)
        self.assertFalse(result.gates.utility_gate)
        self.assertFalse(result.gates.velocity_liquidity_gate)
        self.assertEqual(result.status, "REFERENCE_ONLY_GATED")

    def test_zero_liability_is_not_applicable_and_does_not_open_gate(self):
        g = EconomicGates(**{**passing_gates().__dict__, "outstanding_ref_liability_nano_usd": 0})
        result = calculate_ippr(observations(), 1_000, g)
        self.assertIsNone(result.gates.solvency_gate)
        self.assertEqual(result.status, "REFERENCE_ONLY_GATED")

    def test_qwf_and_guardrail_are_bounded(self):
        with self.assertRaises(IPPRValidationError):
            calculate_ippr(observations(), 1_000, passing_gates(), qwf_multiplier=0)
        with self.assertRaises(IPPRValidationError):
            calculate_ippr(observations(), 1_000, passing_gates(), guardrail_bps=10_001)

    def test_median_integer_rounding(self):
        self.assertEqual(median_int([1, 2, 4, 5]), 3)


if __name__ == "__main__":
    unittest.main()
