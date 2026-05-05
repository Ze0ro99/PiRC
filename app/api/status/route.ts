import { NextResponse } from "next/server";
import { PIRC, PACKETS } from "@/lib/pirc";

// Read-only PiRC live status endpoint.
// Reads PUBLIC chain data only: Horizon for the master issuer account, and
// Soroban RPC `getLatestLedger` / `getNetwork` for the subscription contract's network.
// Secrets are never read or returned here.

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchJson(url: string, init?: RequestInit) {
  try {
    const r = await fetch(url, { ...init, signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!r.ok) return { ok: false, status: r.status };
    return { ok: true, data: await r.json() };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

async function jsonRpc(url: string, method: string, params?: unknown) {
  return fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: params ?? {} }),
  });
}

export async function GET() {
  const [issuerRes, ledgerRes, networkRes] = await Promise.all([
    fetchJson(`${PIRC.horizon}/accounts/${PIRC.master_issuer}`),
    jsonRpc(PIRC.soroban, "getLatestLedger"),
    jsonRpc(PIRC.soroban, "getNetwork"),
  ]);

  const issuer = issuerRes.ok
    ? {
        id: issuerRes.data.account_id,
        sequence: issuerRes.data.sequence,
        subentry_count: issuerRes.data.subentry_count,
        balances: (issuerRes.data.balances || []).map((b: any) => ({
          asset_type: b.asset_type,
          asset_code: b.asset_code,
          balance: b.balance,
        })),
        signers: (issuerRes.data.signers || []).length,
      }
    : { error: (issuerRes as any).error || `HTTP ${(issuerRes as any).status}` };

  const soroban = {
    latest_ledger: ledgerRes.ok
      ? (ledgerRes as any).data.result
      : { error: (ledgerRes as any).error || `HTTP ${(ledgerRes as any).status}` },
    network: networkRes.ok
      ? (networkRes as any).data.result
      : { error: (networkRes as any).error || `HTTP ${(networkRes as any).status}` },
  };

  const env = {
    network: PIRC.network,
    horizon: PIRC.horizon,
    soroban_rpc: PIRC.soroban,
    stellar_secret_present: Boolean(process.env.STELLAR_TESTNET_SECRET),
    pi_api_key_present: Boolean(process.env.PI_API_KEY),
    omni_sync_token_present: Boolean(process.env.OMNI_SYNC_TOKEN),
  };

  return NextResponse.json(
    {
      timestamp: Date.now(),
      master_issuer: PIRC.master_issuer,
      pirc2_subscription: PIRC.pirc2_subscription,
      packets: PACKETS.map(({ index, color, role, contract }) => ({ index, color, role, contract })),
      issuer,
      soroban,
      env,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=10",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
