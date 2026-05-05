import { Sparkles } from "lucide-react";
import { ContractStudio } from "@/components/contract-studio";

export const metadata = {
  title: "Smart Contract Studio — PiRC Warehouse",
  description: "Compose validated PiRC Soroban contract scaffolds with a single click.",
};

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          <Sparkles className="h-3 w-3" aria-hidden />
          Smart Contract Studio
        </span>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Compose <span className="text-imperial">PiRC contracts</span> from validated templates.
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Three battle-tested PiRC patterns — Raw Record, Subscription, and Reserve Asset — wired
          to the canonical conventions of the Compiled Ecosystem. Configure on the left, copy
          straight into a new crate on the right.
        </p>
      </header>

      <ContractStudio />
    </div>
  );
}
