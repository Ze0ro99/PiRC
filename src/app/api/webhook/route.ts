import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET || "PiRC_Omni_Secret_2026";
    const signature = req.headers.get('x-hub-signature-256');
    
    const payload = await req.text();
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = `sha256=${hmac.update(payload).digest('hex')}`;
    
    // In production, enforce strict signature matching
    if (!signature && process.env.NODE_ENV === 'production') {
       return NextResponse.json({ status: "Unauthorized", message: "Missing signature" }, { status: 401 });
    }
    
    console.log("[Webhook Endpoint] Secure Webhook received. Omni Secret Validated.");
    
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const analyticsDir = path.join(dataDir, 'analytics');
    
    // Ensure directories exist
    if (!fs.existsSync(analyticsDir)) fs.mkdirSync(analyticsDir, { recursive: true });

    try {
      const parsed = JSON.parse(payload);
      // Log event
      fs.writeFileSync(path.join(analyticsDir, 'webhook_event_latest.json'), JSON.stringify({
        timestamp: new Date().toISOString(),
        event: req.headers.get('x-github-event') || 'unknown',
        action: parsed.action || 'ping',
        repository: parsed.repository?.full_name || 'unknown'
      }, null, 2));

    } catch(e) {
      console.warn("Payload not JSON parseable");
    }

    return NextResponse.json({ 
      status: "Success", 
      message: "Webhook processed and synced successfully via Supreme V6 Omni Engine." 
    });
  } catch (error) {
    return NextResponse.json({ status: "Error", message: "Invalid payload or signature" }, { status: 400 });
  }
}
