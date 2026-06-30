# PiRC-800: Decentralized Identity & ZK Reputation System

## 1. Abstract
This standard defines a Decentralized Identity (DID) framework optimized for the Pi Network. It leverages Zero-Knowledge Proofs (ZKPs) to allow users to prove Pi Network contribution rates and KYC status without exposing underlying personal identifiable information (PII).

## 2. Motivation
To prevent Sybil attacks and allow ecosystem apps to verify users asynchronously and securely.

## 3. Specification
- **Resolution Resolver**: `did:pirc:<network>:<identifier>`
- **ZK Circuit Protocol**: Plonk-based proofs validating the `kyc_verified_at` variable natively on Soroban state without expanding the payload.
