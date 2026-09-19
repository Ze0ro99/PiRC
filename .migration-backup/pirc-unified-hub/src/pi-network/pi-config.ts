export const PiNetworkConfig = {
  version: "2.5",
  sandbox: process.env.NODE_ENV !== "production",
  agentsEnabled: true,
  supportedDomain: ".pi",
  payments: { enabled: true, currency: "Pi" }
};
