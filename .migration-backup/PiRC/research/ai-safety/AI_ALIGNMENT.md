# PiRC AI Safety & Alignment Guidelines

## Abstract
As PiRC integrates AI-assisted proposal analysis and governance agents (AgentOrchestrator), strict alignment to community consensus and Pi Network's decentralized ethos must be enforced.

## 1. Transparency Rules
- Algorithmic decisions analyzing PiRC drafts must output deterministic audit trails.
- AI must flag conflicts of interest using the `PiRC-800` DID registry.

## 2. Agent Constraints
- Agents participating in `ConvictionVoting` can only query state, they cannot execute `cast_conviction_vote` autonomously without Multi-Sig human counterpart verification.
