import { wallet } from "./wallet.js";
import { TOKEN_LAYERS } from "./token_layers.js";

const RPC = "https://soroban-testnet.stellar.org";

// Ambil balance per contract
export async function fetchBalances() {
  if (!wallet.address) return;

  const rows = document.querySelectorAll("tr[data-layer]");

  for (const row of rows) {
    const layer = row.getAttribute("data-layer");
    const contractId = getContractId(layer);

    const balanceEl = row.querySelector(".balance");
    const statusEl = row.querySelector(".status");

    try {
      balanceEl.innerText = "Loading...";
      statusEl.innerText = "...";

      const res = await fetch(RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getLedgerEntries",
          params: {
            keys: [contractId]
          }
        })
      });

      const data = await res.json();

      // ⚠️ Simplified parsing (nanti bisa kita refine)
      const balance = data?.result ? "OK" : "0";

      balanceEl.innerText = balance;
      statusEl.innerText = "Loaded";

    } catch (err) {
      balanceEl.innerText = "Error";
      statusEl.innerText = "Fail";
      console.error(err);
    }
  }
}

// mapping contract dari layer
function getContractId(layer) {
  const map = {
    L0: "CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4",
    L1: "CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG",
    L2: "CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF",
    L3: "CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF",
    L4: "CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD",
    L5: "CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4",
    L6: "CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO"
  };

  return map[layer];
}
