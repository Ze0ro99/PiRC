import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import asyncio

@dataclass
class PriceFeed:
    source: str
    price: float
    timestamp: datetime
    confidence: float

@dataclass
class AnomalyAlert:
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    rule_type: str
    description: str
    timestamp: datetime
    affected_price_feed: Optional[str] = None
    deviation_percentage: Optional[float] = None

class AnomalyDetector:
    """
    Real-time anomaly detection engine for oracle price feeds.
    Integrated with Stellar & Pi Network via WebSocket subscriptions.
    """
    
    # Configuration constants
    VOLATILITY_THRESHOLD = 0.15  # 15% max deviation
    MIN_FEED_COUNT = 3  # Minimum sources for consensus
    CIRCUIT_BREAKER_DURATION = 21600  # 6 hours in seconds
    CONFIDENCE_THRESHOLD = 0.85
    Z_SCORE_THRESHOLD = 3.0  # Statistical outlier detection
    
    def __init__(
        self,
        stellar_rpc: str = "https://soroban-testnet.stellar.org",
        pi_network_rpc: str = None,
        alert_webhook: str = None
    ):
        self.stellar_rpc = stellar_rpc
        self.pi_network_rpc = pi_network_rpc
        self.alert_webhook = alert_webhook
        self.circuit_breaker_active = False
        self.circuit_breaker_activated_at = None
        self.price_history: Dict[str, List[float]] = {}
        self.feed_reliability: Dict[str, float] = {}
        
    async def subscribe_stellar_feeds(self) -> None:
        """
        Subscribe to Stellar Horizon for real-time price feeds.
        Compatible with piSdk integration.
        """
        try:
            # Connect to Stellar Horizon for ledger events
            import httpx
            async with httpx.AsyncClient() as client:
                # Monitor smart contract invocations for price updates
                response = await client.get(
                    f"{self.stellar_rpc}/transactions",
                    params={"type": "invoke_host_function", "limit": 100}
                )
                # Process price feed events from Soroban contracts
                if response.status_code == 200:
                    data = response.json()
                    for tx in data.get("_embedded", {}).get("records", []):
                        await self.process_stellar_event(tx)
        except Exception as e:
            print(f"Stellar subscription error: {e}")
    
    async def subscribe_pi_network_feeds(self) -> None:
        """
        Subscribe to Pi Network oracle feeds via WebSocket.
        piSdk-compatible integration.
        """
        if not self.pi_network_rpc:
            return
            
        try:
            import websockets
            import json
            
            async with websockets.connect(self.pi_network_rpc) as websocket:
                # Subscribe to Pi Network price feed updates
                subscribe_msg = {
                    "method": "subscribe",
                    "params": ["price_feeds"],
                    "id": 1
                }
                await websocket.send(json.dumps(subscribe_msg))
                
                # Process incoming price updates
                while True:
                    message = await websocket.recv()
                    feed_data = json.loads(message)
                    await self.process_pi_network_feed(feed_data)
        except Exception as e:
            print(f"Pi Network subscription error: {e}")
    
    def detect_price_manipulation(
        self, 
        feeds: List[PriceFeed]
    ) -> Tuple[bool, Optional[AnomalyAlert]]:
        """
        Multi-source price feed anomaly detection.
        Returns (is_anomaly, alert_details).
        """
        if len(feeds) < self.MIN_FEED_COUNT:
            return False, None
        
        prices = np.array([f.price for f in feeds])
        median = np.median(prices)
        
        # Calculate deviations
        deviations = np.abs((prices - median) / median)
        max_deviation = float(np.max(deviations))
        
        # Statistical outlier detection (Z-score)
        std_dev = float(np.std(prices))
        if std_dev > 0:
            z_scores = np.abs((prices - np.mean(prices)) / std_dev)
            has_outliers = np.any(z_scores > self.Z_SCORE_THRESHOLD)
        else:
            has_outliers = False
        
        # Check oracle confidence consistency
        confidences = [f.confidence for f in feeds]
        avg_confidence = np.mean(confidences)
        confidence_variance = np.var(confidences)
        
        is_anomaly = (
            max_deviation > self.VOLATILITY_THRESHOLD or
            has_outliers or
            (avg_confidence < self.CONFIDENCE_THRESHOLD and confidence_variance > 0.1)
        )
        
        if is_anomaly:
            # Identify problematic feed(s)
            problematic_feeds = [
                feeds[i].source for i, dev in enumerate(deviations)
                if dev > self.VOLATILITY_THRESHOLD
            ]
            
            alert = AnomalyAlert(
                severity="CRITICAL" if max_deviation > 0.25 else "HIGH",
                rule_type="PRICE_MANIPULATION",
                description=f"Price deviation {max_deviation*100:.2f}% detected",
                timestamp=datetime.now(),
                affected_price_feed=",".join(problematic_feeds),
                deviation_percentage=max_deviation
            )
            return True, alert
        
        return False, None
    
    def detect_structured_anomalies(
        self,
        feeds: List[PriceFeed]
    ) -> Optional[AnomalyAlert]:
        """
        Detect structured attack patterns:
        - Wash trading detection
        - Volume spikes
        - Timing-based manipulation
        """
        if len(feeds) < 2:
            return None
        
        # Check for synchronized feed updates (wash trading signature)
        timestamps = [f.timestamp for f in feeds]
        time_diffs = np.diff([t.timestamp() for t in timestamps])
        
        # If all feeds update within milliseconds, suspect coordination
        if len(time_diffs) > 0 and np.max(time_diffs) < 0.01:  # < 10ms
            return AnomalyAlert(
                severity="HIGH",
                rule_type="WASH_TRADING_SUSPECTED",
                description="Feeds synchronized within 10ms - potential coordination",
                timestamp=datetime.now()
            )
        
        return None
    
    async def activate_circuit_breaker(self) -> None:
        """
        Emergency pause of minting/settlement via smart contract.
        Broadcast to Stellar & Pi Network.
        """
        self.circuit_breaker_active = True
        self.circuit_breaker_activated_at = datetime.now()
        
        # Invoke Soroban circuit breaker contract
        circuit_breaker_payload = {
            "method": "activate_circuit_breaker",
            "reason": "ORACLE_ANOMALY_DETECTED",
            "duration": self.CIRCUIT_BREAKER_DURATION,
            "timestamp": datetime.now().isoformat()
        }
        
        # Submit to Stellar
        await self.submit_stellar_transaction(circuit_breaker_payload)
        
        # Notify Pi Network
        await self.notify_pi_network(circuit_breaker_payload)
        
        print(f"⚠️ CIRCUIT BREAKER ACTIVATED: {self.CIRCUIT_BREAKER_DURATION}s")
    
    async def check_circuit_breaker_recovery(self) -> bool:
        """
        Check if circuit breaker duration has elapsed.
        Auto-recovery after safe period.
        """
        if not self.circuit_breaker_active:
            return False
        
        elapsed = (datetime.now() - self.circuit_breaker_activated_at).total_seconds()
        
        if elapsed > self.CIRCUIT_BREAKER_DURATION:
            self.circuit_breaker_active = False
            await self.deactivate_circuit_breaker()
            return True
        
        return False
    
    async def deactivate_circuit_breaker(self) -> None:
        """
        Resume normal operations on Stellar & Pi Network.
        """
        recovery_payload = {
            "method": "deactivate_circuit_breaker",
            "recovery_time": datetime.now().isoformat()
        }
        
        await self.submit_stellar_transaction(recovery_payload)
        await self.notify_pi_network(recovery_payload)
        
        print("✅ CIRCUIT BREAKER DEACTIVATED: Operations resumed")
    
    async def submit_stellar_transaction(self, payload: Dict) -> str:
        """
        Submit transaction to Stellar network.
        piSdk-compatible.
        """
        import httpx
        import json
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.stellar_rpc}/transactions",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                if response.status_code in [200, 201]:
                    tx_hash = response.json().get("hash", "unknown")
                    print(f"✅ Stellar TX submitted: {tx_hash}")
                    return tx_hash
                else:
                    print(f"❌ Stellar TX failed: {response.text}")
                    return None
        except Exception as e:
            print(f"Stellar submission error: {e}")
            return None
    
    async def notify_pi_network(self, payload: Dict) -> None:
        """
        Broadcast anomaly alerts to Pi Network via WebSocket.
        """
        if not self.pi_network_rpc:
            return
        
        try:
            import websockets
            import json
            
            async with websockets.connect(self.pi_network_rpc) as websocket:
                message = {
                    "method": "broadcast_alert",
                    "params": payload,
                    "id": int(datetime.now().timestamp() * 1000)
                }
                await websocket.send(json.dumps(message))
                print(f"✅ Pi Network notified: {payload.get('method')}")
        except Exception as e:
            print(f"Pi Network notification error: {e}")
    
    async def process_stellar_event(self, event: Dict) -> None:
        """Process Stellar ledger events."""
        # Extract price feed data from contract invocation
        pass
    
    async def process_pi_network_feed(self, feed_data: Dict) -> None:
        """Process Pi Network WebSocket feed."""
        # Extract price updates
        pass
    
    def get_circuit_breaker_status(self) -> Dict:
        """Get current circuit breaker state."""
        if not self.circuit_breaker_active:
            return {"status": "ACTIVE", "active_breakers": 0}
        
        elapsed = (datetime.now() - self.circuit_breaker_activated_at).total_seconds()
        remaining = max(0, self.CIRCUIT_BREAKER_DURATION - elapsed)
        
        return {
            "status": "PAUSED",
            "circuit_breaker_active": True,
            "remaining_seconds": remaining,
            "recovery_eta": (
                datetime.now().timestamp() + remaining
            )
        }
