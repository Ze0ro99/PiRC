import { Router, type IRouter } from "express";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const router: IRouter = Router();
const owner = "Ze0ro99";
const repo = "PiRC";

function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_PAT;
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "pirc-wealth-core",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubJson(url: string): Promise<any> {
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status}`);
  }
  return response.json();
}

router.get("/github/branches", async (req, res) => {
  try {
    const branches = await githubJson(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
    );
    res.json({
      status: "success",
      data: branches.map((branch: { name: string }) => branch.name),
    });
  } catch (error) {
    req.log.warn({ err: error }, "GitHub branches unavailable");
    res.status(502).json({ error: "Unable to read repository branches" });
  }
});

router.get("/github/tree", async (req, res) => {
  const branch = typeof req.query.branch === "string" ? req.query.branch : "main";
  try {
    const branchInfo = await githubJson(
      `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
    );
    const tree = await githubJson(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchInfo.commit.sha}?recursive=1`,
    );
    res.json({ status: "success", data: tree.tree });
  } catch (error) {
    req.log.warn({ err: error, branch }, "GitHub tree unavailable");
    res.status(502).json({ error: "Unable to read repository tree" });
  }
});

router.get("/github/file", async (req, res) => {
  const filePath = typeof req.query.path === "string" ? req.query.path : "";
  const branch = typeof req.query.branch === "string" ? req.query.branch : "main";
  if (!filePath) {
    res.status(400).json({ error: "Path is required" });
    return;
  }

  try {
    const file = await githubJson(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branch)}`,
    );
    if (Array.isArray(file) || file.type !== "file" || typeof file.content !== "string") {
      res.status(400).json({ error: "Requested path is not a file" });
      return;
    }
    res.json({
      status: "success",
      data: {
        content: Buffer.from(file.content, "base64").toString("utf8"),
        name: file.name,
        path: file.path,
      },
    });
  } catch (error) {
    req.log.warn({ err: error, branch, filePath }, "GitHub file unavailable");
    res.status(502).json({ error: "Unable to read repository file" });
  }
});

router.post("/github/import", async (req, res) => {
  const filePath = typeof req.body?.path === "string" ? req.body.path : "";
  const content = typeof req.body?.content === "string" ? req.body.content : "";
  if (!filePath || !content) {
    res.status(400).json({ error: "Path and content are required" });
    return;
  }

  const importRoot = path.resolve(process.cwd(), "imported");
  const localPath = path.resolve(importRoot, filePath);
  const relativePath = path.relative(importRoot, localPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    res.status(400).json({ error: "Invalid path" });
    return;
  }

  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, content, "utf8");
  res.json({ status: "success", message: `File imported to imported/${relativePath}` });
});

router.post("/auth", async (req, res) => {
  const accessToken = typeof req.body?.accessToken === "string" ? req.body.accessToken : "";
  if (!accessToken) {
    res.status(400).json({ error: "Access token is required" });
    return;
  }

  try {
    const response = await fetch("https://api.minepi.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error(`Pi returned ${response.status}`);
    const user = await response.json();
    res.json({ authenticated: true, user });
  } catch (error) {
    req.log.warn({ err: error }, "Pi authentication failed");
    res.status(401).json({ error: "Authentication failed" });
  }
});

router.get("/pirc_matrix", (_req, res) => {
  const timestamp = Date.now();
  res.json({
    status: "success",
    data: [
      { id: "L1", layer: "Physical", nodeCount: 1560, health: "Optimal", volume: "1.2M", timestamp },
      { id: "L2", layer: "Data Link", nodeCount: 1300, health: "Good", volume: "800k", timestamp },
      { id: "L3", layer: "Network", nodeCount: 3000, health: "Optimal", volume: "3.5M", timestamp },
      { id: "L4", layer: "Transport", nodeCount: 2200, health: "Warning", volume: "4.1M", timestamp },
      { id: "L5", layer: "Session", nodeCount: 1000, health: "Optimal", volume: "1.5M", timestamp },
      { id: "L6", layer: "Presentation", nodeCount: 850, health: "Optimal", volume: "900k", timestamp },
      { id: "L7", layer: "Application", nodeCount: 4500, health: "Optimal", volume: "8.2M", timestamp },
    ],
  });
});

router.get("/contracts", (_req, res) => {
  res.json({
    status: "success",
    data: [
      { id: "C-001", name: "PiRC Vault Soroban", status: "Active", tvl: 4500000, audits: "Passed" },
      { id: "C-002", name: "Matrix Subscription", status: "Deploying", tvl: 0, audits: "Pending" },
      { id: "C-003", name: "RWA Real Estate Tokenizer", status: "Active", tvl: 12500000, audits: "Passed" },
    ],
  });
});

type PaymentMode = "sandbox" | "production";

interface PiPaymentDto {
  identifier?: string;
  amount?: number;
  memo?: string;
  metadata?: Record<string, unknown>;
  transaction?: { txid?: string | null } | null;
  status?: {
    developer_approved?: boolean;
    developer_completed?: boolean;
    cancelled?: boolean;
  };
}

class PiPlatformError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "PiPlatformError";
  }
}

// This allowlist is server-owned. Client-supplied names, amounts and metadata
// are never sufficient to approve an arbitrary payment.
const APPROVED_PRODUCTS: Record<string, { amount: number }> = {
  pirc_premium: { amount: 1.0 },
  compiler_boost: { amount: 0.5 },
  node_boost: { amount: 0.2 },
  dev_tip: { amount: 0.1 },
};

function getPaymentMode(): PaymentMode {
  return process.env.PI_PAYMENT_MODE === "production" && Boolean(process.env.PI_API_KEY)
    ? "production"
    : "sandbox";
}

async function piPlatformRequest<T>(
  pathname: string,
  options: { method?: "GET" | "POST"; body?: Record<string, unknown> } = {},
): Promise<T> {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    throw new PiPlatformError(
      503,
      "Pi payments are disabled: PI_API_KEY is not configured on the server.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`https://api.minepi.com/v2${pathname}`, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Key ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new PiPlatformError(502, "Unable to reach the Pi Platform API.");
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Do not expose raw upstream bodies or credentials in API responses.
  }

  if (!response.ok) {
    const statusCode = response.status === 404 ? 404 : 502;
    throw new PiPlatformError(
      statusCode,
      `Pi Platform API rejected the request (HTTP ${response.status}).`,
    );
  }

  return payload as T;
}

function validateTrustedProduct(payment: PiPaymentDto): void {
  const productId = payment.metadata?.productId;
  if (typeof productId !== "string" || !APPROVED_PRODUCTS[productId]) {
    throw new PiPlatformError(
      400,
      "Payment metadata does not identify an approved server-side product.",
    );
  }

  const expectedAmount = APPROVED_PRODUCTS[productId].amount;
  if (typeof payment.amount !== "number" || Math.abs(payment.amount - expectedAmount) > 1e-8) {
    throw new PiPlatformError(
      400,
      "Payment amount does not match the approved server-side product price.",
    );
  }
}

async function getValidatedPayment(paymentId: string): Promise<PiPaymentDto> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(paymentId)) {
    throw new PiPlatformError(400, "Invalid payment identifier.");
  }

  const payment = await piPlatformRequest<PiPaymentDto>(
    `/payments/${encodeURIComponent(paymentId)}`,
  );
  validateTrustedProduct(payment);
  return payment;
}

function sendPaymentError(
  req: Parameters<typeof router.post>[2] extends never ? never : any,
  res: any,
  error: unknown,
  context: string,
): void {
  if (error instanceof PiPlatformError) {
    res.status(error.statusCode).json({ error: error.message, mode: getPaymentMode() });
    return;
  }

  req.log.warn({ err: error }, context);
  res.status(502).json({ error: "Pi payment processing failed.", mode: getPaymentMode() });
}

router.get("/payments/config", (_req, res) => {
  const configured = Boolean(process.env.PI_API_KEY);
  res.json({
    configured,
    mode: getPaymentMode(),
    paymentsEnabled: configured,
    note: configured
      ? "Server-side payment approval and completion use the Pi Platform API."
      : "Payment operations are disabled until PI_API_KEY is configured server-side.",
  });
});

router.post("/payments/approve", async (req, res) => {
  const paymentId = typeof req.body?.paymentId === "string" ? req.body.paymentId : "";
  if (!paymentId) {
    res.status(400).json({ error: "Payment identifier is required." });
    return;
  }

  try {
    const payment = await getValidatedPayment(paymentId);
    if (payment.status?.developer_approved) {
      res.json({ status: "success", data: payment, alreadyApproved: true, mode: getPaymentMode() });
      return;
    }

    const approval = await piPlatformRequest<PiPaymentDto>(
      `/payments/${encodeURIComponent(paymentId)}/approve`,
      { method: "POST" },
    );
    res.json({ status: "success", data: approval, mode: getPaymentMode() });
  } catch (error) {
    sendPaymentError(req, res, error, "Pi payment approval failed");
  }
});

router.post("/payments/complete", async (req, res) => {
  const paymentId = typeof req.body?.paymentId === "string" ? req.body.paymentId : "";
  const txid = typeof req.body?.txid === "string" ? req.body.txid.trim() : "";
  if (!paymentId || !txid || txid.length > 256) {
    res.status(400).json({ error: "Payment identifier and transaction ID are required." });
    return;
  }

  try {
    const payment = await getValidatedPayment(paymentId);
    const existingTxid = payment.transaction?.txid;
    if (payment.status?.developer_completed) {
      if (existingTxid && existingTxid !== txid) {
        res.status(409).json({ error: "Payment is already completed with a different transaction ID." });
        return;
      }
      res.json({ status: "success", data: payment, alreadyCompleted: true, mode: getPaymentMode() });
      return;
    }

    const completion = await piPlatformRequest<PiPaymentDto>(
      `/payments/${encodeURIComponent(paymentId)}/complete`,
      { method: "POST", body: { txid } },
    );
    res.json({ status: "success", data: completion, completed: true, mode: getPaymentMode() });
  } catch (error) {
    sendPaymentError(req, res, error, "Pi payment completion failed");
  }
});

router.post("/payments/incomplete", async (req, res) => {
  const paymentId = typeof req.body?.paymentId === "string" ? req.body.paymentId : "";
  const suppliedTxid = typeof req.body?.txid === "string" ? req.body.txid.trim() : "";
  if (!paymentId) {
    res.status(400).json({ error: "Payment identifier is required." });
    return;
  }

  try {
    const payment = await getValidatedPayment(paymentId);
    if (payment.status?.developer_completed) {
      res.json({ status: "success", data: { resolved: true, payment }, mode: getPaymentMode() });
      return;
    }

    const txid = suppliedTxid || payment.transaction?.txid || "";
    if (!txid) {
      res.status(202).json({
        status: "pending",
        data: { resolved: false, reason: "No transaction ID is available yet." },
        mode: getPaymentMode(),
      });
      return;
    }

    const completion = await piPlatformRequest<PiPaymentDto>(
      `/payments/${encodeURIComponent(paymentId)}/complete`,
      { method: "POST", body: { txid } },
    );
    res.json({ status: "success", data: { resolved: true, payment: completion }, mode: getPaymentMode() });
  } catch (error) {
    sendPaymentError(req, res, error, "Pi incomplete payment recovery failed");
  }
});

export default router;