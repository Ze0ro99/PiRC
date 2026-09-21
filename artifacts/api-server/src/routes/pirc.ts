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

router.get("/payments/config", (_req, res) => {
  res.json({ configured: Boolean(process.env.PI_NETWORK_API_KEY) });
});

router.post("/payments/incomplete", (_req, res) => {
  res.json({ status: "success", data: { resolved: false, mode: "sandbox" } });
});

router.post("/payments/approve", (_req, res) => {
  res.json({ status: "success", data: { approved: true, mode: "sandbox" } });
});

router.post("/payments/complete", (_req, res) => {
  res.json({ status: "success", data: { completed: true, mode: "sandbox" } });
});

export default router;