import crypto from 'crypto';

/**
 * Verify webhook signatures using HMAC-SHA256 with timing-safe comparison.
 * Protects the /telemetry endpoint from unauthorized payload injection.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const verifyWebhookSignature = (req, res, next) => {
  const signatureHeader = req.headers['x-hub-signature-256'];
  const secret = process.env.LOVABLE_WEBHOOK_SECRET;

  // Fail-safe: Secret must be configured
  if (!secret) {
    console.error('[AUTH] CRITICAL: LOVABLE_WEBHOOK_SECRET is unconfigured on the host server');
    return res.status(500).json({
      error: 'Webhook secret is unconfigured on the host server',
      timestamp: new Date().toISOString()
    });
  }

  // Fail-open for health checks; fail-close for sensitive endpoints
  if (!signatureHeader) {
    console.warn('[AUTH] Missing X-Hub-Signature-256 header on request');
    return res.status(401).json({
      error: 'Missing cryptographic validation token: X-Hub-Signature-256 header required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Generate the expected HMAC-SHA256 signature
    // Uses raw JSON stringified body to match client-side computation
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // Convert both strings to Buffers for timing-safe comparison
    // This prevents side-channel timing attacks that could leak signature information
    const trustedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signatureHeader, 'utf8');

    // Timing-safe equal comparison (constant-time)
    // Returns false if lengths differ OR if bytes differ at ANY position
    if (
      trustedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(trustedBuffer, receivedBuffer)
    ) {
      console.warn('[AUTH] Signature verification failed - possible tampering attempt');
      return res.status(403).json({
        error: 'Invalid cryptographic signature - payload verification failed',
        timestamp: new Date().toISOString()
      });
    }

    // Signature verified - proceed to route handler
    console.log('[AUTH] Webhook signature verified successfully');
    next();
  } catch (err) {
    console.error('[AUTH] Signature verification error:', err.message);
    return res.status(500).json({
      error: 'Signature verification error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Health check middleware - no authentication required
 * Allows monitoring services to verify backend availability
 */
export const healthCheckRoute = (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    service: 'pirc-backend-engine',
    environment: process.env.NODE_ENV || 'unknown'
  });
};
