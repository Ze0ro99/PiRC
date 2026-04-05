# 🔬 Pi SDK Adapter Flow

## Flow

Pi App → Pi SDK → /pi/action → Adapter → PiRC-207 Pipeline → Response

---

## Actions

- register
- verify
- mint

---

## Example

Request:
{
  "piToken": "mock",
  "action": "mint",
  "payload": {
    "asset_id": "RWA-001"
  }
}

Response:
{
  "success": true,
  "data": {
    "tx_id": "pi-123456",
    "status": "SUCCESS"
  }
}
