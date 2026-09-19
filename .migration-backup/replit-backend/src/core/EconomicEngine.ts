/**
 * Economic Engine - PiRC Sovereign Network
 * Genius Logic: 1 Pi = 10,000,000 Micro
 */
export class EconomicEngine {
  public static readonly MICRO_PER_PI = 10_000_000;
  
  static piToMicro(piAmount: number): number {
    return piAmount * this.MICRO_PER_PI;
  }
}
