import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { COLOR_CLASSES, type Packet, shortenAddress } from "@/lib/pirc";
import { CopyButton } from "@/components/copy-button";

export function LayerCard({ packet }: { packet: Packet }) {
  const c = COLOR_CLASSES[packet.color];
  return (
    <article
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 transition-all",
        "hover:bg-card/80 hover:-translate-y-0.5",
      )}
    >
      {/* glow stripe */}
      <span
        className={clsx("absolute inset-x-0 top-0 h-px", c.dot)}
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={clsx("h-2.5 w-2.5 rounded-full", c.dot)} aria-hidden />
          <span className={clsx("font-mono text-[11px] uppercase tracking-[0.18em]", c.text)}>
            Layer {packet.index} · {packet.color}
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">PiRC-{200 + packet.index}</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{packet.role}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
        {packet.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 p-2">
        <code className="truncate font-mono text-[12px] text-foreground/90" title={packet.contract}>
          {shortenAddress(packet.contract, 8, 8)}
        </code>
        <CopyButton value={packet.contract} label="copy id" />
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
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary"
        >
          Stellar Expert <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </article>
  );
}
