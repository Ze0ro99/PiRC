// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PiRC-101 Sovereign Vault (Reference Model)
 * @author EslaM-X Protocol Architect
 * @notice Formalizes 10M:1 Credit Expansion with Quadratic Liquidity Guardrails (Deterministic Spec).
 * @dev Update: Implements hybrid decay for Provenance Invariant Psi.
 */
contract PiRC101Vault {
    // --- Constants ---
    uint256 public constant QWF_MAX = 10_000_000; // 10 Million Multiplier
    uint256 public constant EXIT_CAP_PPM = 1000; // 0.1% Daily Exit Limit

    // --- State Variables ---
    struct GlobalState {
        uint256 totalReserves; // External Pi Locked
        uint256 totalREF;      // Total Internal Credits Minted
        uint256 lastExitTimestamp;
        uint256 dailyExitAmount;
    }

    GlobalState public systemState;
    mapping(address => mapping(uint8 => uint256)) public userBalances;
    
    // Track KYC-verified snapshot wallets to enforce Invariant Psi (Provenance)
    mapping(address => bool) public isSnapshotWallet;

    // --- Events ---
    event CreditExpanded(address indexed user, uint256 piDeposited, uint256 refMinted, uint256 phi);

    /**
     * @notice Deposits External Pi and Mints Internal REF Credits.
     * @param _amount Amount of Pi to lock.
     * @param _class Target utility class (e.g., 0: Retail, 1: GCV, etc.)
     */
    function depositAndMint(uint256 _amount, uint8 _class) external {
        require(_amount > 0, "Amount must be greater than zero");
        
        // --- Mock Oracle Data (Must integrate decentralized aggregator) ---
        uint256 piPrice = 314000; // $0.314 (scaled to 6 decimals)
        uint256 currentLiquidity = 10_000_000 * 1e6; // $10M Market Depth (scaled to 6 decimals)

        // --- Calculate Phi (The Throttling Coefficient) ---
        uint256 phi = calculatePhi(currentLiquidity, systemState.totalREF);
        
        // --- Insolvency Guardrail Check ---
        require(phi > 0, "Minting Paused: External Solvency Guardrail Activated.");

        // --- Expansion Logic (Pi -> USD -> 10M REF) ---
        uint256 capturedValue = (_amount * piPrice) / 1e6;
        
        // Update: Determine WCF based on Provenance (Mined vs External)
        uint256 wcf = 1e18; // 1.0 (Assume External Pi weight default)
        
        // If the depositor is using Pi directly from their snapshot wallet:
        if (isSnapshotWallet[msg.sender]) {
            wcf = 1e25; // Placeholder for extreme W_m weight (1 mined Pi = 10M credit)
        }

        uint256 mintAmount = (capturedValue * QWF_MAX * phi * wcf) / 1e36;

        // --- Update State ---
        systemState.totalReserves += _amount;
        systemState.totalREF += mintAmount;
        userBalances[msg.sender][_class] += mintAmount;

        emit CreditExpanded(msg.sender, _amount, mintAmount, phi);
    }

    /**
     * @notice Pure, deterministic calculation of the Phi guardrail invariant.
     */
    function calculatePhi(uint256 _depth, uint256 _supply) public pure returns (uint256) {
        if (_supply == 0) return 1e18; // 1.0 (Full Expansion permitted at start)
        uint256 ratio = (_depth * 1e18) / _supply; // Note: simplified 1:1 QWF scaling assumption
        if (ratio >= 1.5e18) return 1e18; // Healthy threshold (Gamma = 1.5)
        return (ratio * ratio) / 2.25e18; // Quadratic Throttling (ratio^2 / Gamma^2)
    }
}

