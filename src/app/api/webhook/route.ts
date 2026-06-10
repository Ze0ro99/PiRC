import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    // SECURITY PATCH: Strictly reading from environment to prevent repo exposure
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    
    if (!secret) {
        console.error("[CRITICAL] Webhook secret missing from environment variables.");
        return NextResponse.json({ status: "Error", message: "Server configuration error" }, { status: 500 });
    }

    const signature = req.headers.get('x-hub-signature-256');
    const payload = await req.text();
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = `sha256=${hmac.update(payload).digest('hex')}`;

    // Validate Signature
    if (!signature || signature !== expectedSignature) {
       return NextResponse.json({ status: "Unauthorized", message: "Missing or invalid HMAC signature" }, { status: 401 });
    }

    console.log("[Webhook Endpoint] Secure Webhook received. HMAC Validated.");

    const dataDir = path.join(process.cwd(), 'public', 'data');
    const analyticsDir = path.join(dataDir, 'analytics');
    
    if (!fs.existsSync(analyticsDir)) fs.mkdirSync(analyticsDir, { recursive: true });

    try {
      const parsed = JSON.parse(payload);
      // Synchronize GitHub payload metrics
      fs.writeFileSync(path.join(analyticsDir, 'webhook_event_latest.json'), JSON.stringify({
        timestamp: new Date().toISOString(),
        event: req.headers.get('x-github-event') || 'unknown',
        action: parsed.action || 'ping',
        repository: parsed.repository?.full_name || 'unknown'
      }, null, 2));

    } catch(e) {
      console.warn("[WARNING] Payload not JSON parseable");
    }

    return NextResponse.json({
      status: "Success",
      message: "Webhook processed and synced successfully via Supreme V7 Omni Engine."
    });
  } catch (error) {
    return NextResponse.json({ status: "Error", message: "Invalid payload execution" }, { status: 400 });
  }
}
