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

const app = express();
app.use(express.json());

const server = new Server("https://horizon-testnet.stellar.org");

// 🔐 Keypairs (replace in production)
const issuer = Keypair.random();
const distributor = Keypair.random();

// 🔐 DB
const db = {
  assets: {},
  txs: []
};

// 🔐 Verify Signature
function verifySignature(payload, signature, publicKey) {
  return nacl.sign.detached.verify(
    Buffer.from(JSON.stringify(payload)),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );
}

// 🔐 Middleware
function auth(req, res, next) {
  const { payload, signature, publicKey } = req.body;

  if (!verifySignature(payload, signature, publicKey)) {
    return res.status(403).json({ error: "Invalid signature" });
  }

  req.data = payload;
  next();
}

// 📌 Register
app.post("/rwa/register", auth, (req, res) => {
  const { asset_id, owner } = req.data;

  db.assets[asset_id] = { owner, status: "registered" };

  res.json({ asset_id, status: "registered" });
});

// 📌 Verify
app.post("/rwa/verify", auth, (req, res) => {
  const { asset_id } = req.data;

  if (!db.assets[asset_id]) {
    return res.status(404).json({ error: "Not found" });
  }

  db.assets[asset_id].status = "verified";

  res.json({ asset_id, status: "verified" });
});

// 🚀 Mint Engine (REAL + MOCK)
app.post("/token/mint", auth, async (req, res) => {
  const { asset_id, amount, mode } = req.data;

  if (mode === "stellar") {
    try {
      const asset = new Asset(asset_id, issuer.publicKey());
      const account = await server.loadAccount(issuer.publicKey());

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

      const result = await server.submitTransaction(tx);

      db.txs.push(result);

      return res.json({
        network: "stellar",
        tx_hash: result.hash,
        status: "SUCCESS"
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 🧪 MOCK PI
  const mockTx = {
    network: "pi-testnet-mock",
    tx_id: "pi-" + Date.now(),
    status: "SUCCESS"
  };

  db.txs.push(mockTx);

  res.json(mockTx);
});

// 📌 Transfer (mock for now)
app.post("/token/transfer", auth, (req, res) => {
  res.json({
    status: "SUCCESS",
    message: "Transfer executed (mock layer)"
  });
});

app.listen(3000, () => {
  console.log("🚀 Hybrid Engine Running (Stellar + Pi Mock)");
});
