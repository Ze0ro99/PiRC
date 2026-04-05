import { TOKEN_LAYERS } from "./token_layers.js";

export async function fetchBalances(walletAddress) {
  const results = [];

  try {
    const res = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${walletAddress}`
    );

    const data = await res.json();

    for (const token of TOKEN_LAYERS) {

      const balance = data.balances.find(
        b => b.asset_code === token.layer
      );

      results.push({
        layer: token.layer,
        balance: balance ? balance.balance : "0",
        status: balance ? "OK" : "EMPTY"
      });
    }

  } catch (e) {
    console.error("Balance fetch error:", e);

    for (const token of TOKEN_LAYERS) {
      results.push({
        layer: token.layer,
        balance: "ERR",
        status: "ERROR"
      });
    }
  }

  return results;
}
