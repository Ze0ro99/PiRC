import random

class Agent:
    def __init__(self, behavior_type):
        self.type = behavior_type
        self.pi_balance = random.uniform(100, 5000)
        self.ref_balance = 0

    def decide_action(self, phi, liquidity_trend):
        # 1. Opportunistic Minter: Rushes to mint if Phi is dropping but still high enough
        if self.type == "Opportunistic":
            if 0.5 < phi < 0.9: 
                return "MINT_MAX"
            return "HOLD"
            
        # 2. Defensive Exiter: Panics if liquidity drops or Phi crashes
        elif self.type == "Defensive":
            if liquidity_trend == "DOWN" or phi < 0.4:
                return "EXIT_ALL"
            return "HOLD"
            
        # 3. Steady Merchant: Mints a little bit every day regardless of conditions
        elif self.type == "Steady":
            return "MINT_PARTIAL"

class PiRC101_Stochastic_Sim:
    def __init__(self, num_agents=100):
        self.epoch = 0
        self.pi_price = 0.314
        self.liquidity = 10_000_000
        self.ref_supply = 0
        self.qwf = 10_000_000
        self.gamma = 1.5
        self.exit_cap = 0.001
        
        # Create a heterogeneous population of agents
        self.agents = [Agent(random.choice(["Opportunistic", "Defensive", "Steady"])) for _ in range(num_agents)]

    def get_phi(self):
        if self.ref_supply == 0: return 1.0
        ratio = (self.liquidity * self.exit_cap) / (self.ref_supply / self.qwf)
        return 1.0 if ratio >= self.gamma else (ratio / self.gamma) ** 2

    def run_epoch(self):
        self.epoch += 1
        
        # Stochastic Market Movement (Random Walk)
        market_shift = random.uniform(-0.15, 0.10) # Heavy downward bias for stress testing
        self.pi_price *= (1 + market_shift)
        self.liquidity *= (1 + market_shift)
        liquidity_trend = "DOWN" if market_shift < 0 else "UP"

        phi = self.get_phi()
        daily_exit_pool = self.liquidity * self.exit_cap
        exit_requests = 0

        # Agents React to the Market
        for agent in self.agents:
            action = agent.decide_action(phi, liquidity_trend)
            
            if action == "MINT_MAX" and agent.pi_balance > 0:
                minted = agent.pi_balance * self.pi_price * self.qwf * phi
                self.ref_supply += minted
                agent.ref_balance += minted
                agent.pi_balance = 0
                
            elif action == "MINT_PARTIAL" and agent.pi_balance > 10:
                minted = 10 * self.pi_price * self.qwf * phi
                self.ref_supply += minted
                agent.ref_balance += minted
                agent.pi_balance -= 10
                
            elif action == "EXIT_ALL" and agent.ref_balance > 0:
                exit_requests += agent.ref_balance

        # Process Exits (Throttled by the Exit Cap)
        exit_cleared = min(exit_requests, daily_exit_pool * self.qwf)
        self.ref_supply -= exit_cleared

        print(f"Epoch {self.epoch:02d} | Price: ${self.pi_price:.3f} | Liq: ${self.liquidity:,.0f} | Phi: {phi:.4f} | Exits Pending: {(exit_requests - exit_cleared):,.0f} REF")

# Run a 30-Day Stress Test
sim = PiRC101_Stochastic_Sim(num_agents=50)
print("--- Starting 30-Day Stochastic Agent-Based Stress Test ---")
for _ in range(30):
    sim.run_epoch()

