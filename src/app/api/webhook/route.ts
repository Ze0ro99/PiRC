import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("Webhook received:", payload);
    // In production, verify GITHUB_WEBHOOK_SECRET here
    return NextResponse.json({ status: "Success", message: "Webhook processed and data synced to Lovable." });
  } catch (error) {
    return NextResponse.json({ status: "Error", message: "Invalid payload" }, { status: 400 });
  }
}
