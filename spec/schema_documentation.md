# RWA Authentication Schema v0.3
Standardized trust model for hardware-to-chain binding.
- Signature: ECDSA/Ed25519
- NFC Invariant: SignedPayload = sign(PID + ChipUID)
Ref: Discussion #72
