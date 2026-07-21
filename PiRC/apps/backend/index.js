import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyWebhookSignature, healthCheckRoute } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware with CRLF sanitization
// Prevents log injection attacks via control characters in HTTP headers
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Sanitize inputs to prevent log injection (CRLF stripping)
  // Replace carriage return (\r) and line feed (\n) with underscore
  const cleanMethod = req.method.replace(/[^A-Z]/g, '');
  const cleanPath = req.path.replace(/[\r\n]/g, '_');

  console.log(`[${timestamp}] ${cleanMethod} ${cleanPath}`);
  next();
});

// Health check endpoint - NO authentication required
// Public monitoring and deployment verification
app.get('/health', healthCheckRoute);

// Telemetry ingestion endpoint - PROTECTED with HMAC-SHA256
// Only accepts signed payloads from authorized sources
app.post('/telemetry', verifyWebhookSignature, (req, res) => {
  const {
    circuit_breaker_status,
    active_wcf_weight,
    total_tokenized_rwa_units,
    system_timestamp
  } = req.body;

  // Validate required fields
  if (
    circuit_breaker_status === undefined ||
    active_wcf_weight === undefined ||
    total_tokenized_rwa_units === undefined ||
    system_timestamp === undefined
  ) {
    return res.status(400).json({
      error: 'Missing required telemetry fields',
      required: [
        'circuit_breaker_status',
        'active_wcf_weight',
        'total_tokenized_rwa_units',
        'system_timestamp'
      ],
      timestamp: new Date().toISOString()
    });
  }

  // Log the received telemetry
  const telemetryEntry = {
    circuit_breaker_status,
    active_wcf_weight,
    total_tokenized_rwa_units,
    system_timestamp,
    received_at: new Date().toISOString(),
    server_timestamp: Math.floor(Date.now() / 1000)
  };

  console.log('[TELEMETRY]', JSON.stringify(telemetryEntry, null, 2));

  // TODO: Phase 3 Integration
  // - Store in persistent backend cache or database
  // - Forward to lovable.app dashboard via authenticated webhook
  // - Implement circuit breaker state machine tracking

  res.status(200).json({
    success: true,
    message: 'Telemetry received and validated',
    data: {
      recorded_at: telemetryEntry.received_at,
      system_timestamp: telemetryEntry.system_timestamp
    }
  });
});

// Status endpoint for system introspection
app.get('/status', (req, res) => {
  res.json({
    service: 'pirc-backend-engine',
    version: '3.0.0',
    environment: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[PiRC Backend Engine v3.0.0] Running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Health Check: GET http://localhost:${PORT}/health`);
  console.log(`Telemetry (Signed): POST http://localhost:${PORT}/telemetry`);
  console.log(`Status: GET http://localhost:${PORT}/status`);
  console.log(`${'='.repeat(60)}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] SIGTERM received, closing gracefully...');
  process.exit(0);
});
