import type { Metadata } from "next";
import { ExternalLink, Radio } from "lucide-react";
import { SubscriptionConsole } from "@/components/subscription-console";
import { CopyButton } from "@/components/copy-button";
import { PIRC, shortenAddress } from "@/lib/pirc";

export const metadata: Metadata = {
  title: "PiRC2 Subscriptions",
  description: "Subscribe to L1 GOLD layer access via the PiRC2 Soroban subscription engine. Includes the decentralized keeper batch renewal bounty.",
};

const CLI_TEMPLATE = `soroban contract invoke \\
  --id ${PIRC.pirc2_subscription} \\
  --source <YOUR_SECRET_KEY> \\
  --network testnet \\
  -- subscribe \\
  --subscriber <PIONEER_G_ADDRESS> \\
  --service_id 0 \\
  --pay_upfront true`;

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          PiRC-2 · Subscription Engine
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Subscribe once. Renew forever.
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          The PiRC-2 contract uses Soroban&apos;s <code className="font-mono">do_approve</code>{" "}
          allowance pattern so subscribers do not re-sign each charge. A decentralized keeper
          triggers the batch and the contract pays a bounty for guaranteeing uptime.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-[12px]">
            <Radio className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-muted-foreground">contract</span>
            <span>{shortenAddress(PIRC.pirc2_subscription, 8, 8)}</span>
            <CopyButton value={PIRC.pirc2_subscription} label="copy" />
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${PIRC.pirc2_subscription}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            View on Stellar Expert <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </header>

      <section className="mt-10">
        <SubscriptionConsole />
      </section>

      {/* CLI snippet */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Soroban CLI invocation</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
          For automated environments. Methods are documented in <code className="font-mono">PiRC2/8-admin-methods.md</code> and{" "}
          <code className="font-mono">PiRC2/7-query-methods.md</code>.
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              shell · soroban-cli
            </span>
            <CopyButton value={CLI_TEMPLATE} label="copy command" />
          </div>
          <pre className="scrollbar-thin overflow-x-auto px-4 py-4 font-mono text-[12px] leading-relaxed text-foreground/90">
{CLI_TEMPLATE}
          </pre>
        </div>
      </section>

      {/* Method tables */}
      <section className="mt-12 grid gap-4 lg:grid-cols-2">
        <MethodCard
          title="Subscriber methods"
          methods={[
            { name: "subscribe(subscriber, service_id, pay_upfront)", desc: "Begin a subscription. Issues do_approve allowance." },
            { name: "toggle_pay_upfront(enable)", desc: "Enable/disable upfront mode. Used for cancel-on-period-end." },
            { name: "claim_refund(period)", desc: "Refund unused upfront periods if eligible." },
          ]}
        />
        <MethodCard
          title="Keeper / admin methods"
          methods={[
            { name: "process(merchant, offset, limit)", desc: "Charge a paginated batch of subscribers for the given merchant." },
            { name: "trigger_batch_renewal()", desc: "Convenience entry point. Pays a bounty to the caller on success." },
            { name: "set_bounty(amount)", desc: "Admin-only. Tunes the keeper bounty." },
          ]}
        />
      </section>
    </div>
  );
}

function MethodCard({
  title,
  methods,
}: {
  title: string;
  methods: { name: string; desc: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 divide-y divide-border">
        {methods.map((m) => (
          <li key={m.name} className="py-3">
            <code className="block break-all font-mono text-[12px] text-foreground/90">{m.name}</code>
            <p className="mt-1 text-xs text-muted-foreground text-pretty">{m.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
