import unittest

from scripts.testnet1_acceptance import GateError, SimulatedEconomy, run_rehearsal


class Testnet1AcceptanceTests(unittest.TestCase):
    def test_full_rehearsal_passes_and_is_explicitly_local(self):
        report = run_rehearsal()
        self.assertEqual(report["status"], "PASS")
        self.assertFalse(report["network_writes"])
        self.assertEqual(report["summary"]["layers"], 7)
        self.assertEqual(report["summary"]["passed"], 9)

    def test_swap_slippage_guard(self):
        sim = SimulatedEconomy()
        with self.assertRaisesRegex(GateError, "slippage"):
            sim.swap("alice", 1000, 999999)

    def test_payment_replay_requires_same_transaction(self):
        sim = SimulatedEconomy()
        sim.create_payment("p1", "alice", 10)
        sim.approve_payment("p1", "alice")
        sim.complete_payment("p1", "alice", "tx1")
        with self.assertRaisesRegex(GateError, "different transaction"):
            sim.complete_payment("p1", "alice", "tx2")

    def test_event_is_idempotent(self):
        sim = SimulatedEconomy()
        self.assertTrue(sim.ingest_event("e1"))
        self.assertFalse(sim.ingest_event("e1"))

    def test_settlement_conserves_and_rejects_replay(self):
        sim = SimulatedEconomy()
        result = sim.settle("month-1", 101, {"a": 1, "b": 2}, "digest")
        self.assertEqual(sum(result.values()), 101)
        with self.assertRaisesRegex(GateError, "already settled"):
            sim.settle("month-1", 101, {"a": 1}, "digest-2")

    def test_withdrawal_fails_closed_without_provenance(self):
        sim = SimulatedEconomy()
        with self.assertRaisesRegex(GateError, "eligibility"):
            sim.request_withdrawal("w1", 1, identity=True, provenance=False,
                                   eligible=True, reserve_available=10)


if __name__ == "__main__":
    unittest.main()
