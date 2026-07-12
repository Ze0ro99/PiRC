# PiRC-208: Automated Anomaly Detection & Circuit Breaker

## Overview

Real-time oracle manipulation detection with automatic emergency pause mechanism.

### Features

✅ **Multi-source Price Feed Validation**
- Consensus across 3+ independent sources
- Median-based outlier detection
- Z-score statistical analysis

✅ **Attack Pattern Recognition**
- Wash trading detection (synchronized updates)
- Price manipulation (>15% deviation)
- Oracle confidence anomalies

✅ **Automatic Circuit Breaker**
- Sub-second activation on anomaly
- 6-hour recovery window
- Broadcast to Stellar & Pi Network

✅ **Stellar & Pi Network Integration**
- WebSocket subscriptions for real-time feeds
- Soroban smart contract invocation
- piSdk-compatible deployment

## Architecture

### Python Anomaly Detector
```python
detector = AnomalyDetector(
    stellar_rpc="https://soroban-testnet.stellar.org",
    pi_network_rpc="wss://pi-network.example.com",
    alert_webhook="https://governance.example.com/alerts"
)

# Subscribe to feeds
await detector.subscribe_stellar_feeds()
await detector.subscribe_pi_network_feeds()

# Process incoming prices
is_anomaly, alert = detector.detect_price_manipulation(feeds)
if is_anomaly:
    await detector.activate_circuit_breaker()
```

### Soroban Circuit Breaker Contract
```rust
// Activate emergency pause
circuit_breaker::activate(
    env,
    Symbol::new(&env, "ORACLE_ANOMALY"),
    21600  // 6-hour duration
)

// Auto-recovery when safe
circuit_breaker::check_recovery(env)
```

## Deployment

### v25 Compatibility
- Python 3.10+ with numpy, websockets
- Soroban SDK 27.0.0
- Stellar Testnet

### v26 Features
- Machine learning-based anomaly detection
- Graduated response levels
- Governance override capability

### v27 Advanced
- Multi-chain oracle aggregation
- Predictive anomaly forecasting
- Distributed circuit breaker consensus

## Testing

```bash
# Unit tests
cargo test --manifest-path contracts/circuit_breaker/Cargo.toml

# Integration tests with real oracles
pytest simulator/test_anomaly_detector.py

# Load testing
python simulator/load_test_feeds.py --feeds=100 --duration=3600
```

## Monitoring

```typescript
// Check circuit breaker status in frontend
const status = await circuitBreakerContract.status();
if (status.active) {
  console.log(`Recovery in ${status.remaining_seconds}s`);
}
```
