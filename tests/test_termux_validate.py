"""Regression tests for the offline-first Termux validator."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts import termux_validate


class ValidatorSafetyTests(unittest.TestCase):
    def test_redact_hides_github_tokens_and_assignments(self):
        sample = "token=ghp_abcdefghijklmnopqrstuvwxyz1234567890 api_key='abc123456789'"
        cleaned = termux_validate.redact(sample)
        self.assertNotIn("ghp_", cleaned)
        self.assertNotIn("abc123456789", cleaned)
        self.assertIn("[REDACTED", cleaned)

    def test_json_check_reports_invalid_file_without_raising(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "schemas").mkdir()
            (root / "schemas" / "valid.json").write_text('{"ok": true}', encoding="utf-8")
            (root / "schemas" / "invalid.json").write_text("{broken", encoding="utf-8")
            with patch.object(termux_validate, "ROOT", root):
                checked = termux_validate.json_check()
        self.assertEqual(checked["status"], "FAIL")
        self.assertIn("JSONDecodeError", checked["detail"])

    def test_secret_scan_reports_path_without_secret_value(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "src").mkdir()
            (root / "src" / "config.py").write_text(
                'API_KEY="super_secret_value_123456"', encoding="utf-8")
            with patch.object(termux_validate, "ROOT", root):
                checked = termux_validate.secret_scan()
        self.assertEqual(checked["status"], "FAIL")
        self.assertIn("src/config.py", checked["detail"])
        self.assertNotIn("super_secret_value_123456", checked["detail"])

    def test_secret_named_env_file_is_flagged_without_reading_value(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / ".env").write_text("PRIVATE_VALUE=do-not-print", encoding="utf-8")
            with patch.object(termux_validate, "ROOT", root):
                checked = termux_validate.secret_scan()
        self.assertEqual(checked["status"], "FAIL")
        self.assertIn(".env", checked["detail"])
        self.assertNotIn("do-not-print", checked["detail"])


if __name__ == "__main__":
    unittest.main()
