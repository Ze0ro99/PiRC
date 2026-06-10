import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { getSimulatedMetrics } from './services/telemetrySimulator.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Hardened Logging Middleware (CodeQL CRLF Cleaned)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const cleanMethod = req.method.replace(/[^A-Z]/g, '');
  const cleanPath = req.path.replace(/[\r\n]/g, '_');

  console.log(`[${timestamp}] ${cleanMethod} ${cleanPath}`);
  next();
});

// 2. Public Health Verification Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "operational",
    timestamp: new Date().toISOString(),
    version: "3.0.0",
    service: "pirc-backend-engine",
    environment: process.env.NODE_ENV || 'staging'
  });
});

// 3. Public Systemic Telemetry Route (Phase 4 Ingestion Sink)
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = getSimulatedMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to compile systemic telemetry layer',
      timestamp: new Date().toISOString() 
    });
  }
});

// 4. Secured Telemetry Receiving Endpoint (HMAC Protected)
app.post('/telemetry', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const secret = process.env.LOVABLE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("Critical System Warning: LOVABLE_WEBHOOK_SECRET is unconfigured.");
    return res.status(500).json({ error: "Internal security configuration missing" });
  }

  if (!signature) {
    return res.status(401).json({ error: "Unauthorized: Missing X-Hub-Signature-256 header" });
  }

  const computedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature.length !== computedSignature.length || 
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))) {
    return res.status(401).json({ error: "Unauthorized: Cryptographic signature mismatch" });
  }

  res.status(202).json({ status: "acknowledged", processedAt: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`📡 PiRC Engine online and bound to internal routing table on port ${PORT}`);
});
