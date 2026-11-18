import unittest
from decimal import Decimal

from scripts.audit_testnet1_liquidity import asset_details, build_report


class TestTestnetLiquidityAudit(unittest.TestCase):
    def test_native_and_credit_asset_parsing(self):
        self.assertEqual(asset_details("native")["code"], "PI")
        parsed = asset_details("OUSD:GABC")
        self.assertEqual(parsed["code"], "OUSD")
        self.assertEqual(parsed["issuer"], "GABC")

    def test_lp_underlying_estimate_and_ousd_detection(self):
        account = {
            "sequence": "123",
            "sequence_ledger": 100,
            "last_modified_ledger": 100,
            "balances": [
                {"asset_type": "native", "balance": "54.0"},
                {"asset_type": "credit_alphanum4", "asset_code": "PGOLD", "asset_issuer": "GISSUER", "balance": "10"},
                {"asset_type": "liquidity_pool_shares", "liquidity_pool_id": "POOL1", "balance": "2"},
            ],
        }
        report = build_report(
            "G" + "A" * 55,
            account,
            lambda _pool_id: {
                "liquidity_pool": {
                    "total_shares": "10",
                    "fee_bp": 30,
                    "reserves": [
                        {"asset": "OUSD:GOUSDISSUER", "amount": "1000"},
                        {"asset": "native", "amount": "500"},
                    ],
                }
            },
            ousd_issuer="GOUSDISSUER",
        )
        self.assertEqual(report["ousd_status"], "EXPECTED_OUSD_ISSUER_LIQUIDITY_POOL_FOUND")
        self.assertEqual(report["liquidity_pools"][0]["share_percent"], "20.0")
        self.assertEqual(
            Decimal(report["liquidity_pools"][0]["reserves"][0]["estimated_account_underlying"]),
            Decimal("200.0"),
        )

    def test_no_ousd_is_not_inferred_from_other_layer_tokens(self):
        account = {
            "balances": [
                {"asset_type": "credit_alphanum4", "asset_code": "PGOLD", "asset_issuer": "GISSUER", "balance": "10"},
                {"asset_type": "credit_alphanum4", "asset_code": "GOLD", "asset_issuer": "GISSUER", "balance": "20"},
            ]
        }
        report = build_report("G" + "A" * 55, account, lambda _pool_id: {})
        self.assertEqual(report["ousd_status"], "NO_OUSD_ASSET_CODE_FOUND_IN_ACCOUNT_OR_INSPECTED_POOLS")
        self.assertEqual(report["liquidity_pool_share_count"], 0)

    def test_ousd_code_without_expected_issuer_is_not_verified(self):
        account = {"balances": [{"asset_type": "credit_alphanum4", "asset_code": "OUSD", "asset_issuer": "GOTHER", "balance": "5"}]}
        report = build_report("G" + "A" * 55, account, lambda _pool_id: {}, ousd_issuer="GOUSDISSUER")
        self.assertEqual(report["ousd_status"], "OUSD_CODE_FOUND_ISSUER_MISMATCH")
        self.assertEqual(report["ousd_account_balances"], [])

    def test_invalid_pool_payload_is_unknown_not_empty_pool(self):
        account = {"balances": [{"asset_type": "liquidity_pool_shares", "liquidity_pool_id": "POOL-BAD", "balance": "1"}]}
        report = build_report("G" + "A" * 55, account, lambda _pool_id: {"title": "Not Found"}, ousd_issuer="GOUSDISSUER")
        self.assertEqual(report["ousd_status"], "OUSD_NOT_FOUND_BUT_LIQUIDITY_AUDIT_INCOMPLETE")
        self.assertEqual(len(report["liquidity_pool_fetch_errors"]), 1)

    def test_pool_lookup_failure_is_unknown_not_no_ousd_proof(self):
        account = {
            "balances": [
                {"asset_type": "liquidity_pool_shares", "liquidity_pool_id": "POOL-FAIL", "balance": "1"}
            ]
        }
        def fail(_pool_id):
            raise RuntimeError("temporary Horizon failure")
        report = build_report("G" + "A" * 55, account, fail)
        self.assertEqual(report["ousd_status"], "OUSD_NOT_FOUND_BUT_LIQUIDITY_AUDIT_INCOMPLETE")
        self.assertEqual(len(report["liquidity_pool_fetch_errors"]), 1)


if __name__ == "__main__":
    unittest.main()
