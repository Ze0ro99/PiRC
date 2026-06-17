import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { Octokit } from "octokit";
import rateLimit from "express-rate-limit";
import { randomBytes, createHmac, timingSafeEqual } from "crypto";

function sanitizeForLog(value: unknown, fallback = "n/a"): string {
  if (value === null || value === undefined) return fallback;
  return String(value).replace(/[\r\n]/g, "");
}

async function startServer() {
  const app = express();

  // ─── Port: Read from environment for Replit ($PORT), Vercel, Lovable, or fallback ───
  const PORT = parseInt(process.env.PORT || process.env.VITE_PORT || "3000", 10);

  // ─── CORS: Allow Vercel preview URLs, Lovable.app, Replit.dev, and localhost ───
  const allowedOrigins = [
    /\.vercel\.app$/,
    /\.lovable\.app$/,
    /\.lovableproject\.com$/,
    /\.replit\.dev$/,
    /\.repl\.co$/,
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, curl)
        if (!origin) return callback(null, true);
        const allowed = allowedOrigins.some((pattern) => pattern.test(origin));
        if (allowed) return callback(null, true);
        // Also allow explicitly whitelisted custom origin from env
        if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Hub-Signature-256"],
    })
  );

  app.use(express.json({ limit: "2mb" }));

  // ─── Global rate limiter ───
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use(limiter);

  // ─── Stricter limiter for import & write endpoints ───
  const importLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Import rate limit exceeded." },
  });

  // ─── Health-check endpoint (Vercel, Lovable, Replit all ping this) ───
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      env: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      piNetwork: process.env.PI_NETWORK_API_KEY ? "configured" : "not-configured",
      github: process.env.GITHUB_PAT ? "configured" : "not-configured",
    });
  });

  // ─── GitHub Integration ───
  const getOctokit = () => {
    const pat = process.env.GITHUB_PAT;
    if (!pat) {
      throw new Error("GITHUB_PAT environment variable is not set.");
    }
    return new Octokit({ auth: pat });
  };

  const REPO_OWNER = "Ze0ro99";
  const REPO_NAME = "PiRC";

  app.get("/api/github/branches", async (_req, res) => {
    try {
      const octokit = getOctokit();
      const response = await octokit.rest.repos.listBranches({
        owner: REPO_OWNER,
        repo: REPO_NAME,
      });
      res.json({ status: "success", data: response.data.map((b: any) => b.name) });
    } catch (error: any) {
      console.error("GitHub API Error (branches):", error.message);
      if (error.message.includes("GITHUB_PAT")) {
        return res.status(503).json({ error: "GitHub integration not configured. Set GITHUB_PAT.", code: "MISSING_GITHUB_PAT" });
      }
      res.status(500).json({ error: "Failed to fetch branches from GitHub" });
    }
  });

  app.get("/api/github/tree", async (req, res) => {
    try {
      const { branch = "main" } = req.query;
      const octokit = getOctokit();
      const branchInfo = await octokit.rest.repos.getBranch({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        branch: branch as string,
      });
      const sha = branchInfo.data.commit.sha;
      const treeResponse = await octokit.rest.git.getTree({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        tree_sha: sha,
        recursive: "1",
      });
      res.json({ status: "success", data: treeResponse.data.tree });
    } catch (error: any) {
      console.error("GitHub API Error (tree):", error.message);
      if (error.message.includes("GITHUB_PAT")) {
        return res.status(503).json({ error: "GitHub integration not configured. Set GITHUB_PAT.", code: "MISSING_GITHUB_PAT" });
      }
      res.status(500).json({ error: "Failed to fetch repository tree" });
    }
  });

  app.get("/api/github/file", async (req, res) => {
    try {
      const { path, branch = "main" } = req.query;
      if (!path) return res.status(400).json({ error: "Path is required" });

      const octokit = getOctokit();
      const response = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path as string,
        ref: branch as string,
      });

      if (Array.isArray(response.data)) {
        return res.status(400).json({ error: "Requested path is a directory" });
      }

      if (response.data.type === "file" && "content" in response.data) {
        const content = Buffer.from(response.data.content, "base64").toString("utf8");
        res.json({ status: "success", data: { content, name: response.data.name, path: response.data.path } });
      } else {
        res.status(404).json({ error: "File not found or not a valid file" });
      }
    } catch (error: any) {
      console.error("GitHub API Error (file):", error.message);
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  });

  app.post("/api/github/import", importLimiter, async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      if (!filePath || !content) {
        return res.status(400).json({ error: "Path and content are required" });
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const p = require("path");

      const importRoot = p.resolve(process.cwd(), "imported");
      const localPath = p.resolve(importRoot, filePath);
      const relativePath = p.relative(importRoot, localPath);

      // Path traversal guard
      if (relativePath.startsWith("..") || p.isAbsolute(relativePath)) {
        return res.status(400).json({ error: "Invalid file path" });
      }

      fs.mkdirSync(p.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, content, "utf8");

      res.json({ status: "success", message: `File imported to imported/${relativePath}` });
    } catch (error: any) {
      console.error("Import Error:", error.message);
      res.status(500).json({ error: "Failed to import file" });
    }
  });

  // ─── GitHub Webhook (for automatic sync from Lovable / Replit pushes) ───
  app.post("/api/webhooks/sync", express.raw({ type: "application/json" }), (req, res) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (secret) {
      const sig = req.headers["x-hub-signature-256"] as string | undefined;
      if (!sig) {
        return res.status(401).json({ error: "Missing webhook signature" });
      }
      const expected = "sha256=" + createHmac("sha256", secret).update(req.body).digest("hex");
      try {
        if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      } catch {
        return res.status(401).json({ error: "Signature validation failed" });
      }
    }

    const payload = JSON.parse(req.body.toString());
    const eventType = sanitizeForLog(req.headers["x-github-event"]);
    const ref = sanitizeForLog(payload?.ref);
    console.log(`[Webhook] event=${eventType} ref=${ref}`);

    // Acknowledge immediately; heavy processing would be queued here
    res.status(200).json({ status: "received", event: eventType });
  });

  // ─── Pi Network Auth ───
  app.post("/api/auth", async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({ error: "Access token is required" });
      }

      const piApiBase = process.env.PI_NETWORK_API_URL || "https://api.minepi.com";

      const piResponse = await fetch(`${piApiBase}/v2/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!piResponse.ok) {
        throw new Error("Invalid Pi Network access token");
      }

      const userData = await piResponse.json();

      res.json({
        authenticated: true,
        user: userData,
        sessionId: randomBytes(16).toString("hex"),
      });
    } catch (error: any) {
      console.error("Pi Auth Error:", error.message);
      res.status(401).json({ error: "Authentication failed" });
    }
  });

  // ─── Pi Network Payments ───
  app.get("/api/payments/config", (_req, res) => {
    res.json({
      status: "success",
      data: {
        appId: process.env.PI_APP_ID || "pirc-sovereign",
        sandbox: process.env.NODE_ENV !== "production",
        network: process.env.NODE_ENV === "production" ? "mainnet" : "testnet",
        piApiBase: process.env.PI_NETWORK_API_URL || "https://api.minepi.com",
      },
    });
  });

  app.post("/api/payments/approve", async (req, res) => {
    try {
      const { paymentId } = req.body;
      if (!paymentId) return res.status(400).json({ error: "paymentId is required" });
      if (typeof paymentId !== "string" || !/^[A-Za-z0-9_-]+$/.test(paymentId)) {
        return res.status(400).json({ error: "Invalid paymentId format" });
      }

      const apiKey = process.env.PI_NETWORK_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: "Pi Network API key not configured.", code: "MISSING_PI_API_KEY" });
      }

      const piApiBase = process.env.PI_NETWORK_API_URL || "https://api.minepi.com";
      const safePaymentId = encodeURIComponent(paymentId);
      const response = await fetch(`${piApiBase}/v2/payments/${safePaymentId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error("Pi approve error:", errBody);
        return res.status(response.status).json({ error: "Pi Network approval failed", detail: errBody });
      }

      const data = await response.json();
      res.json({ status: "success", data });
    } catch (error: any) {
      console.error("Payment Approve Error:", error.message);
      res.status(500).json({ error: "Failed to approve payment" });
    }
  });

  app.post("/api/payments/complete", async (req, res) => {
    try {
      const { paymentId, txid } = req.body;
      if (!paymentId || !txid) {
        return res.status(400).json({ error: "paymentId and txid are required" });
      }
      if (typeof paymentId !== "string" || !/^[A-Za-z0-9_-]+$/.test(paymentId)) {
        return res.status(400).json({ error: "Invalid paymentId format" });
      }

      const apiKey = process.env.PI_NETWORK_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: "Pi Network API key not configured.", code: "MISSING_PI_API_KEY" });
      }

      const piApiBase = process.env.PI_NETWORK_API_URL || "https://api.minepi.com";
      const safePaymentId = encodeURIComponent(paymentId);
      const response = await fetch(`${piApiBase}/v2/payments/${safePaymentId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error("Pi complete error:", errBody);
        return res.status(response.status).json({ error: "Pi Network completion failed", detail: errBody });
      }

      const data = await response.json();
      res.json({ status: "success", data });
    } catch (error: any) {
      console.error("Payment Complete Error:", error.message);
      res.status(500).json({ error: "Failed to complete payment" });
    }
  });

  app.post("/api/payments/incomplete", async (req, res) => {
    try {
      const { paymentId } = req.body;
      if (!paymentId) return res.status(400).json({ error: "paymentId is required" });

      const safePaymentIdForLog = String(paymentId).replace(/\r|\n/g, "");
      // Log and acknowledge — actual cancellation logic depends on Pi SDK state
      console.warn(`[Payments] Incomplete payment found: ${safePaymentIdForLog}`);
      res.json({ status: "acknowledged", paymentId });
    } catch (error: any) {
      console.error("Payment Incomplete Error:", error.message);
      res.status(500).json({ error: "Failed to handle incomplete payment" });
    }
  });

  // ─── Matrix API ───
  app.get("/api/pirc_matrix", (_req, res) => {
    res.json({
      status: "success",
      data: [
        { id: "L1", layer: "Physical", nodeCount: 1560, health: "Optimal", volume: "1.2M", timestamp: Date.now() },
        { id: "L2", layer: "Data Link", nodeCount: 1300, health: "Good", volume: "800k", timestamp: Date.now() },
        { id: "L3", layer: "Network", nodeCount: 3000, health: "Optimal", volume: "3.5M", timestamp: Date.now() },
        { id: "L4", layer: "Transport", nodeCount: 2200, health: "Warning", volume: "4.1M", timestamp: Date.now() },
        { id: "L5", layer: "Session", nodeCount: 1000, health: "Optimal", volume: "1.5M", timestamp: Date.now() },
        { id: "L6", layer: "Presentation", nodeCount: 850, health: "Optimal", volume: "900k", timestamp: Date.now() },
        { id: "L7", layer: "Application", nodeCount: 4500, health: "Optimal", volume: "8.2M", timestamp: Date.now() },
      ],
    });
  });

  // ─── Contracts Registry API ───
  app.get("/api/contracts", (_req, res) => {
    res.json({
      status: "success",
      data: [
        { id: "C-001", name: "PiRC Vault Soroban", status: "Active", tvl: 4500000, audits: "Passed" },
        { id: "C-002", name: "Matrix Subscription Engine", status: "Deploying", tvl: 0, audits: "Pending" },
        { id: "C-003", name: "RWA Real Estate Tokenizer", status: "Active", tvl: 12500000, audits: "Passed" },
      ],
    });
  });

  // ─── Vite dev middleware or production static serving ───
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ─── Start listening — bind to 0.0.0.0 for Replit/container environments ───
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PiRC] Server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || "development"})`);
  });
}

startServer().catch((err) => {
  console.error("[PiRC] Fatal server error:", err);
  process.exit(1);
});
