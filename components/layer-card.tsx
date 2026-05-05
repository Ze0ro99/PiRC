import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { COLOR_CLASSES, type Packet, shortenAddress } from "@/lib/pirc";
import { CopyButton } from "@/components/copy-button";

export function LayerCard({ packet }: { packet: Packet }) {
  const c = COLOR_CLASSES[packet.color];
  return (
    <article
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 transition-all",
        "hover:border-primary/40 hover:bg-card/90 hover:-translate-y-0.5",
      )}
    >
      {/* color rail */}
      <span
        className={clsx("absolute inset-y-0 left-0 w-1", c.dot)}
        aria-hidden
      />
      {/* color glow stripe */}
      <span
        className={clsx("absolute inset-x-0 top-0 h-px opacity-60", c.dot)}
        aria-hidden
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={clsx("relative h-2 w-2 rounded-full", c.dot, c.text, "pulse-dot")} aria-hidden />
          <span className={clsx("font-mono text-[10.5px] uppercase tracking-[0.2em]", c.text)}>
            Layer {packet.index} · {packet.color}
          </span>
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          PiRC-{200 + packet.index}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{packet.role}</h3>
      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
        {packet.description}
      </p>

      <div className="mt-4 rounded-md border border-border bg-muted/30 p-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            Soroban C-address
          </span>
          <CopyButton value={packet.contract} label="copy" />
        </div>
        <code
          className="mt-1.5 block truncate font-mono text-[12px] text-foreground/90"
          title={packet.contract}
        >
          {shortenAddress(packet.contract, 10, 10)}
        </code>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={`/contracts#${packet.color.toLowerCase()}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          Details
        </Link>
        <a
          href={packet.stellar_expert}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
        >
          Stellar Expert <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </article>
  );
}
