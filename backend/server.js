import express from "express";
import nacl from "tweetnacl";
import {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  Asset
} from "stellar-sdk";

import {
  verifyPiUser,
  mapPiToInternal,
  formatPiResponse
} from "./piAdapter.js";

const app = express();
app.use(express.json());

//  Stellar
const stellar = new Server("https://horizon-testnet.stellar.org");
const issuer = Keypair.random();
const distributor = Keypair.random();

// 🗄️ DB
const db = {
  assets: {},
  txs: []
};

////////////////////////////////////////////////////
//  AUTH (Non-Pi)
////////////////////////////////////////////////////
function verifySignature(payload, signature, publicKey) {
  return nacl.sign.detached.verify(
    Buffer.from(JSON.stringify(payload)),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );
}

function auth(req, res, next) {
  const { payload, signature, publicKey } = req.body;

  if (!verifySignature(payload, signature, publicKey)) {
    return res.status(403).json({ error: "Invalid signature" });
  }

  req.data = payload;
  next();
}

////////////////////////////////////////////////////
//  SERVICE LAYER (NO DUPLICATION)
////////////////////////////////////////////////////
function registerAsset(asset_id, owner) {
  db.assets[asset_id] = { owner, status: "registered" };
  return { asset_id, status: "registered" };
}

function verifyAsset(asset_id) {
  if (!db.assets[asset_id]) throw new Error("Not found");
  db.assets[asset_id].status = "verified";
  return { asset_id, status: "verified" };
}

async function mintToken(asset_id, amount, mode = "mock") {
  if (mode === "stellar") {
    const asset = new Asset(asset_id, issuer.publicKey());
    const account = await stellar.loadAccount(issuer.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination: distributor.publicKey(),
          asset,
          amount: amount.toString()
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(issuer);

    const result = await stellar.submitTransaction(tx);

    db.txs.push(result);

    return {
      network: "stellar",
      tx_hash: result.hash,
      status: "SUCCESS"
    };
  }

  // 🧪 Mock Pi
  const mockTx = {
    network: "pi-mock",
    tx_id: "pi-" + Date.now(),
    status: "SUCCESS"
  };

  db.txs.push(mockTx);
  return mockTx;
}

////////////////////////////////////////////////////
//  CORE API (SIGNED CLIENT)
////////////////////////////////////////////////////
app.post("/rwa/register", auth, (req, res) => {
  try {
    const result = registerAsset(req.data.asset_id, req.data.owner);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/rwa/verify", auth, (req, res) => {
  try {
    const result = verifyAsset(req.data.asset_id);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/token/mint", auth, async (req, res) => {
  try {
    const result = await mintToken(
      req.data.asset_id,
      req.data.amount,
      req.data.mode
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

////////////////////////////////////////////////////
// 🔗 PI SDK ADAPTER (ENTRY POINT)
////////////////////////////////////////////////////
app.post("/pi/action", async (req, res) => {
  try {
    const { piToken, action, payload } = req.body;

    const user = verifyPiUser(piToken);
    if (!user) {
      return res.status(401).json({ error: "Invalid Pi user" });
    }

    const data = mapPiToInternal(user, payload);

    if (action === "register") {
      const result = registerAsset(data.asset_id, data.owner);
      return res.json(formatPiResponse(result));
    }

    if (action === "verify") {
      const result = verifyAsset(data.asset_id);
      return res.json(formatPiResponse(result));
    }

    if (action === "mint") {
      //  Bridge ke REAL ENGINE
      const result = await mintToken(
        data.asset_id,
        data.amount,
        "stellar" // bisa diganti "mock" kalau mau Pi mode
      );

      return res.json(formatPiResponse(result));
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

////////////////////////////////////////////////////
//  TX LOOKUP
////////////////////////////////////////////////////
app.get("/tx/:id", (req, res) => {
  const tx = db.txs.find(
    t => t.tx_id === req.params.id || t.tx_hash === req.params.id
  );

  if (!tx) return res.status(404).json({ error: "Not found" });

  res.json(tx);
});

////////////////////////////////////////////////////
//  START
////////////////////////////////////////////////////
app.listen(3000, () => {
  console.log("🚀 PiRC-207 Hybrid Server Running (Pi + Stellar)");
});
