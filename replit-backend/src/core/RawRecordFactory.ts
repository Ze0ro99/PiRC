export class RawRecordFactory {
  static createRecord(assetId: string, valueInPi: number) {
    return { assetId, microValue: valueInPi * 10_000_000, timestamp: Date.now() };
  }
}
