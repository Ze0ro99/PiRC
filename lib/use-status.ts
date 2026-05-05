"use client";

import useSWR from "swr";

export type StatusPayload = {
  timestamp: number;
  master_issuer: string;
  pirc2_subscription: string;
  packets: { index: number; color: string; role: string; contract: string }[];
  issuer: {
    id?: string;
    sequence?: string;
    subentry_count?: number;
    balances?: { asset_type: string; asset_code?: string; balance: string }[];
    signers?: number;
    error?: string;
  };
  soroban: {
    latest_ledger?: { sequence?: number; protocolVersion?: number; id?: string } & Record<string, unknown>;
    network?: { passphrase?: string; friendbotUrl?: string; protocolVersion?: number } & Record<string, unknown>;
  };
  env: {
    network: string;
    horizon: string;
    soroban_rpc: string;
    stellar_secret_present: boolean;
    pi_api_key_present: boolean;
    omni_sync_token_present: boolean;
  };
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as StatusPayload;
  });

export function useStatus() {
  return useSWR<StatusPayload>("/api/status", fetcher, {
    refreshInterval: 15_000,
    revalidateOnFocus: false,
  });
}
