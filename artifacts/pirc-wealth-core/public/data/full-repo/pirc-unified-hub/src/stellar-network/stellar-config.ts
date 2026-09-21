import * as StellarSdk from 'stellar-sdk';
export const StellarConfig = {
  network: process.env.NODE_ENV === "production" ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET,
  serverUrl: process.env.NODE_ENV === "production" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org",
  agentsEnabled: true
};
