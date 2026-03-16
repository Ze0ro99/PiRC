/**
 * Vanguard Bridge Mathematical Modeling Engine
 * Optimized for the PIRC-101 Weight Protocol.
 */

// Global constant definition: 10 Million Micros = 1 Macro Pi
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
    // Note: This multiplier (10M) is a conceptual baseline based on refWeight analysis.
    return macroPiAmount * 10000000 * refWeightMultiplier;
}
