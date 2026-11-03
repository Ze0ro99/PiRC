import json
import unittest
from pathlib import Path

from reference.economic_engine import (
    EconomicInvariantError,
    PeriodLedger,
    allocate_largest_remainder,
    reserve_coverage_bps,
    settle_period,
    supply_growth_bps,
)


class EconomicEngineTests(unittest.TestCase):
    def test_net_revenue_subtracts_all_senior_obligations(self):
        ledger = PeriodLedger("2026-10", "PI-ATOMIC", 1_000, 100, 50, 75, 125, 150)
        self.assertEqual(ledger.distributable, 500)

    def test_underfunded_period_fails_closed(self):
        ledger = PeriodLedger("2026-10", "PI-ATOMIC", 100, 50, 20, 20, 10, 10)
        with self.assertRaises(EconomicInvariantError):
            _ = ledger.distributable

    def test_largest_remainder_conserves_every_atomic_unit(self):
        allocation = allocate_largest_remainder(10, {"bob": 1, "alice": 1, "carol": 1})
        self.assertEqual(allocation.amounts, {"alice": 4, "bob": 3, "carol": 3})
        self.assertEqual(sum(allocation.amounts.values()), 10)

    def test_zero_weights_rejected_for_positive_distribution(self):
        with self.assertRaises(EconomicInvariantError):
            allocate_largest_remainder(1, {"alice": 0, "bob": 0})

    def test_zero_distribution_does_not_require_positive_weights(self):
        self.assertEqual(allocate_largest_remainder(0, {"alice": 0}).amounts, {"alice": 0})

    def test_zero_distribution_still_validates_participant_inputs(self):
        ledger = PeriodLedger("p0", "ASSET-A", 0, 0, 0, 0, 0, 0)
        with self.assertRaises(EconomicInvariantError):
            settle_period(ledger, {"alice": -1})

    def test_empty_population_only_accepts_zero(self):
        self.assertEqual(allocate_largest_remainder(0, {}).total, 0)
        with self.assertRaises(EconomicInvariantError):
            allocate_largest_remainder(1, {})

    def test_rejects_float_and_boolean_amounts(self):
        for bad in (1.0, True, -1):
            with self.subTest(bad=bad):
                with self.assertRaises(EconomicInvariantError):
                    allocate_largest_remainder(bad, {"alice": 1})

    def test_reserve_coverage_uses_integer_basis_points(self):
        self.assertEqual(reserve_coverage_bps(125, 100), 12_500)
        self.assertEqual(reserve_coverage_bps(1, 0), None)

    def test_supply_growth_is_not_called_price_inflation(self):
        self.assertEqual(supply_growth_bps(1_000, 1_050), 500)
        self.assertEqual(supply_growth_bps(1_000, 950), -500)
        self.assertIsNone(supply_growth_bps(0, 0))

    def test_period_settlement_cannot_exceed_distributable_resources(self):
        ledger = PeriodLedger("p1", "ASSET-A", 101, 1, 0, 0, 0, 0)
        result = settle_period(ledger, {"a": 1, "b": 1})
        self.assertEqual(result.total, 100)
        self.assertEqual(sum(result.amounts.values()), 100)

    def test_portable_golden_vectors(self):
        fixture_path = Path(__file__).resolve().parents[1] / "fixtures" / "economic-engine-vectors.json"
        fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
        self.assertEqual(fixture["fixture_version"], "1.0.0")
        for case in fixture["cases"]:
            with self.subTest(case_id=case["case_id"]):
                if case["kind"] == "period_ledger":
                    ledger = PeriodLedger(**case["input"])
                    if "expected_error" in case:
                        with self.assertRaisesRegex(EconomicInvariantError, case["expected_error"]):
                            _ = ledger.distributable
                    else:
                        self.assertEqual(ledger.distributable, case["expected_distributable"])
                elif case["kind"] == "allocation":
                    self.assertEqual(allocate_largest_remainder(case["total"], case["weights"]).amounts, case["expected_allocations"])
                elif case["kind"] == "reserve_coverage_bps":
                    self.assertEqual(reserve_coverage_bps(case["eligible_reserves"], case["redeemable_liabilities"]), case["expected"])
                elif case["kind"] == "supply_growth_bps":
                    self.assertEqual(supply_growth_bps(case["previous_supply"], case["current_supply"]), case["expected"])
                else:
                    self.fail(f"unknown golden vector kind: {case['kind']}")


if __name__ == "__main__":
    unittest.main()
