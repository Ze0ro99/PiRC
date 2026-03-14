/**
 * Vanguard Bridge Mathematical Modeling Engine
 * Optimized for the PIRC-101 Weight Protocol.
 */

// 10 Million Micros = 1 Macro Pi
const MICROS_PER_MACRO_PI = 10000000; 

/**
 * Normalizes CEX-facing mining units ("Micros") into Ecosystem-facing Macro Pi Units.
 * This addresses the aggregative compression logic seen in PiScan vs ExplorePi.
 * @param {number} microAmount - The amount of Micros (often seen in mined balances).
 * @returns {number} The Macro Pi equivalent.
 */
export function normalizeMicrosToMacro(microAmount) {
    return microAmount / MICROS_PER_MACRO_PI;
}

/**
 * Calculates the Weighted Contribution Factor (WCF) or Justice Parity Price.
 * The formula weights the compressed utility, not the raw speculative count.
 * @param {number} macroPiAmount - The amount of compressed Macro Pi units.
 * @param {number} refWeightMultiplier - The ecosystem Ref Weight multiplier.
 * @returns {number} The calculated Parity Price (Conceptual).
 */
export function calculateWcfParity(macroPiAmount, refWeightMultiplier) {
    // Conceptual realization of 1 Pi having fixed utility heft protecting miners.
    // If Macro Pi price shows as 0.17$ parity internally, the WCF value is calibrated.
    return macroPiAmount * 10000000 * refWeightMultiplier; // 10M as base backing weight multiplier.
}

