import { NextResponse } from "next/server";
import { PIRC, PACKETS } from "@/lib/pirc";

export async function GET() {
  return NextResponse.json(
    {
      schema: "pirc.7-layer-packets/v1",
      environment: "production",
      network: PIRC.network.toLowerCase(),
      mainnet_ready: false,
      master_issuer: PIRC.master_issuer,
      pirc2_subscription: PIRC.pirc2_subscription,
      layers: PACKETS,
      pi_dapp_portal: {
        appName: "PiRC",
        appUrl: "https://pi-rc.vercel.app/",
        isTestnet: true,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
