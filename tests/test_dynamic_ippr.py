import unittest

from reference.dynamic_ippr import (
    EconomicGates,
    IPPRValidationError,
    PriceObservation,
    aggregate_oracle,
    calculate_ippr,
    median_int,
)


def observations(prices=(72_955_500, 72_956_000, 72_955_000), age=10):
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
    def test_ippr_rebases_from_live_pi_usd_times_fixed_ten_million(self):
        result = calculate_ippr(
            observations((72_955_500, 72_955_500, 72_955_500)),
            1_000, passing_gates(), qwf_current=10_072_123,
            network_velocity_ppm=511_500,
        )
        self.assertEqual(result.external_price_nano_usd_per_pi, 72_955_500)
        self.assertEqual(result.ippr_supply_multiplier, 10_000_000)
        self.assertEqual(result.ippr_nano_usd_per_pi, 729_555_000_000_000)
        self.assertEqual(result.qwf_current, 10_072_123)
        self.assertEqual(result.network_velocity_ppm, 511_500)
        self.assertEqual(result.phi_ppm, 37_049)
        self.assertEqual(result.status, "REFERENCE_ONLY_GATES_PASSED")

    def test_ippr_tracks_market_price_not_qwf(self):
        low = calculate_ippr(
            observations((10_000_000, 10_000_000, 10_000_000)),
            1_000, passing_gates(), qwf_current=10_000_000,
            network_velocity_ppm=500_000,
        )
        high = calculate_ippr(
            observations((20_000_000, 20_000_000, 20_000_000)),
            1_000, passing_gates(), qwf_current=20_000_000,
            network_velocity_ppm=500_000,
        )
        self.assertEqual(high.ippr_nano_usd_per_pi, low.ippr_nano_usd_per_pi * 2)

    def test_qwf_changes_phi_but_does_not_change_ippr_rebase(self):
        low_qwf = calculate_ippr(
            observations(), 1_000, passing_gates(),
            qwf_current=10_000_000, network_velocity_ppm=511_500,
        )
        high_qwf = calculate_ippr(
            observations(), 1_000, passing_gates(),
            qwf_current=20_000_000, network_velocity_ppm=511_500,
        )
        self.assertEqual(low_qwf.ippr_nano_usd_per_pi, high_qwf.ippr_nano_usd_per_pi)
        self.assertGreater(low_qwf.phi_ppm, high_qwf.phi_ppm)

    def test_oracle_requires_three_independent_venues(self):
        with self.assertRaisesRegex(IPPRValidationError, "quorum"):
            aggregate_oracle(observations((72_955_500, 72_956_000)), 1_000)

    def test_oracle_rejects_duplicate_venue(self):
        obs = observations()
        obs[1] = PriceObservation(obs[0].venue_id, obs[1].price_nano_usd_per_pi, obs[1].observed_at)
        with self.assertRaisesRegex(IPPRValidationError, "independent"):
            aggregate_oracle(obs, 1_000)

    def test_oracle_rejects_stale_or_future_quotes(self):
        with self.assertRaisesRegex(IPPRValidationError, "stale"):
            aggregate_oracle(observations(age=121), 1_000)
        future = [PriceObservation(f"v{i}", 72_955_500, 1_001) for i in range(3)]
        with self.assertRaisesRegex(IPPRValidationError, "future"):
            aggregate_oracle(future, 1_000)

    def test_oracle_deviation_circuit_breaker(self):
        with self.assertRaisesRegex(IPPRValidationError, "deviation"):
            aggregate_oracle(observations((72_955_500, 72_955_500, 145_911_000)), 1_000)

    def test_fourth_gate_blocks_under_collateralized_liability(self):
        g = EconomicGates(**{**passing_gates().__dict__, "eligible_reserves_nano_usd": 10})
        result = calculate_ippr(observations(), 1_000, g, 10_000_000, 500_000)
        self.assertFalse(result.gates.solvency_gate)
        self.assertEqual(result.status, "REFERENCE_ONLY_GATED")

    def test_utility_and_velocity_gates_are_required(self):
        g = EconomicGates(**{
            **passing_gates().__dict__,
            "active_merchants": 0,
            "settled_volume_nano_usd": 0,
        })
        result = calculate_ippr(observations(), 1_000, g, 10_000_000, 500_000)
        self.assertFalse(result.gates.utility_gate)
        self.assertFalse(result.gates.velocity_liquidity_gate)
        self.assertEqual(result.status, "REFERENCE_ONLY_GATED")

    def test_zero_liability_is_not_applicable_and_does_not_open_gate(self):
        g = EconomicGates(**{**passing_gates().__dict__, "outstanding_ref_liability_nano_usd": 0})
        result = calculate_ippr(observations(), 1_000, g, 10_000_000, 500_000)
        self.assertIsNone(result.gates.solvency_gate)
        self.assertEqual(result.status, "REFERENCE_ONLY_GATED")

    def test_qwf_and_velocity_must_be_valid(self):
        with self.assertRaisesRegex(IPPRValidationError, "qwf_current"):
            calculate_ippr(observations(), 1_000, passing_gates(), 0, 500_000)
        with self.assertRaisesRegex(IPPRValidationError, "velocity"):
            calculate_ippr(observations(), 1_000, passing_gates(), 10_000_000, 100_000_001)

    def test_median_integer_rounding(self):
        self.assertEqual(median_int([1, 2, 4, 5]), 3)


if __name__ == "__main__":
    unittest.main()
