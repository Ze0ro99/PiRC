"use client";

import { useMemo, useState } from "react";
import { Boxes, Coins, FileCode, Radio, Sparkles, Wand2 } from "lucide-react";
import clsx from "clsx";
import { CopyButton } from "./copy-button";

type Template = {
  id: string;
  label: string;
  blurb: string;
  icon: typeof Boxes;
  build: (opts: { name: string; pid: number; admin: string }) => string;
  cargo: (opts: { name: string }) => string;
};

const TEMPLATES: Template[] = [
  {
    id: "raw-record",
    label: "Raw Record",
    blurb: "Append-only immutable record with hash linking and event publish.",
    icon: FileCode,
    build: ({ name, pid, admin }) => `#![no_std]
#![forbid(unsafe_code)]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Bytes, BytesN, Vec};

#[contracttype]
pub struct Record {
    pub index: u32,
    pub prev_hash: BytesN<32>,
    pub hash: BytesN<32>,
    pub timestamp: u64,
    pub payload: Bytes,
}

#[contract]
pub struct ${name};

#[contractimpl]
impl ${name} {
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("ADMIN"), &admin);
        env.storage().instance().set(&symbol_short!("PID"),   &${pid}u32);
    }

    pub fn append(env: Env, caller: Address, payload: Bytes) -> u32 {
        caller.require_auth();
        let mut chain: Vec<Record> = env.storage().persistent().get(&symbol_short!("CHAIN"))
            .unwrap_or(Vec::new(&env));
        let index = chain.len();
        let prev_hash = if index == 0 {
            BytesN::from_array(&env, &[0u8; 32])
        } else {
            chain.get_unchecked(index - 1).hash.clone()
        };
        let timestamp = env.ledger().timestamp();
        let mut buf = Bytes::new(&env);
        buf.append(&prev_hash.clone().into());
        buf.append(&payload);
        let hash = env.crypto().sha256(&buf);
        chain.push_back(Record { index, prev_hash, hash: hash.clone(), timestamp, payload });
        env.storage().persistent().set(&symbol_short!("CHAIN"), &chain);
        env.events().publish((symbol_short!("RAW"), symbol_short!("APPEND")), (${pid}u32, hash));
        index
    }

    pub fn length(env: Env) -> u32 {
        let chain: Vec<Record> = env.storage().persistent().get(&symbol_short!("CHAIN"))
            .unwrap_or(Vec::new(&env));
        chain.len()
    }
}

// Admin: ${admin}
`,
    cargo: ({ name }) => `[package]
name = "${name.toLowerCase()}"
version = "1.0.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "22.0"

[profile.release]
opt-level = "z"
overflow-checks = true
strip = "symbols"
panic = "abort"
codegen-units = 1
lto = true
`,
  },
  {
    id: "subscription",
    label: "Subscription",
    blurb: "Recurring charge via token allowance (do_approve pattern).",
    icon: Radio,
    build: ({ name, pid, admin }) => `#![no_std]
#![forbid(unsafe_code)]
use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env};

#[contract]
pub struct ${name};

#[contractimpl]
impl ${name} {
    pub fn init(env: Env, admin: Address, token: Address, amount: i128, period: u64) {
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("ADMIN"),  &admin);
        env.storage().instance().set(&symbol_short!("TOKEN"),  &token);
        env.storage().instance().set(&symbol_short!("AMT"),    &amount);
        env.storage().instance().set(&symbol_short!("PERIOD"), &period);
        env.storage().instance().set(&symbol_short!("PID"),    &${pid}u32);
    }

    pub fn charge(env: Env, subscriber: Address, merchant: Address) {
        // Keeper-driven: relies on prior do_approve allowance set by the subscriber.
        let token_addr: Address = env.storage().instance().get(&symbol_short!("TOKEN")).unwrap();
        let amount:     i128    = env.storage().instance().get(&symbol_short!("AMT")).unwrap();
        let client = token::Client::new(&env, &token_addr);
        client.transfer_from(&env.current_contract_address(), &subscriber, &merchant, &amount);
        env.events().publish((symbol_short!("SUB"), symbol_short!("CHARGE")), (${pid}u32, subscriber));
    }
}

// Admin: ${admin}
`,
    cargo: ({ name }) => `[package]
name = "${name.toLowerCase()}"
version = "1.0.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { version = "22.0", features = ["alloc"] }

[profile.release]
opt-level = "z"
overflow-checks = true
strip = "symbols"
panic = "abort"
codegen-units = 1
lto = true
`,
  },
  {
    id: "reserve",
    label: "Reserve Asset",
    blurb: "Issuer-controlled reserve currency with 7-decimal precision.",
    icon: Coins,
    build: ({ name, pid, admin }) => `#![no_std]
#![forbid(unsafe_code)]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String};

#[contract]
pub struct ${name};

#[contractimpl]
impl ${name} {
    pub fn init(env: Env, admin: Address, name: String, symbol: String) {
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("ADMIN"),  &admin);
        env.storage().instance().set(&symbol_short!("DEC"),    &7u32); // PiRC parity
        env.storage().instance().set(&symbol_short!("NAME"),   &name);
        env.storage().instance().set(&symbol_short!("SYM"),    &symbol);
        env.storage().instance().set(&symbol_short!("PID"),    &${pid}u32);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&symbol_short!("ADMIN")).unwrap();
        admin.require_auth();
        env.events().publish((symbol_short!("RES"), symbol_short!("MINT")), (${pid}u32, to, amount));
    }

    pub fn parity() -> i128 { 314159i128 } // sovereign parity
}

// Admin: ${admin}
`,
    cargo: ({ name }) => `[package]
name = "${name.toLowerCase()}"
version = "1.0.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "22.0"

[profile.release]
opt-level = "z"
overflow-checks = true
strip = "symbols"
panic = "abort"
codegen-units = 1
lto = true
`,
  },
];

const ADMIN_DEFAULT = "GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6";

export function ContractStudio() {
  const [tplId, setTplId] = useState(TEMPLATES[0].id);
  const [name, setName] = useState("PiRC261Contract");
  const [pid, setPid] = useState(261);
  const [admin, setAdmin] = useState(ADMIN_DEFAULT);

  const tpl = TEMPLATES.find((t) => t.id === tplId)!;
  const lib = useMemo(() => tpl.build({ name, pid, admin }), [tpl, name, pid, admin]);
  const cargo = useMemo(() => tpl.cargo({ name }), [tpl, name]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Controls */}
      <aside className="lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Studio controls
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                Template
              </label>
              <div className="mt-2 grid gap-2">
                {TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  const active = tplId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTplId(t.id)}
                      className={clsx(
                        "flex items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                        active
                          ? "border-primary/40 bg-primary/[0.10]"
                          : "border-border bg-muted/40 hover:bg-muted",
                      )}
                    >
                      <Icon className={clsx("mt-0.5 h-4 w-4", active ? "text-primary" : "text-muted-foreground")} aria-hidden />
                      <div>
                        <div className="text-sm font-medium">{t.label}</div>
                        <div className="text-[11px] text-muted-foreground">{t.blurb}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Contract name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s+/g, ""))}
                className="w-full rounded-md border border-border bg-input px-3 py-1.5 font-mono text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>

            <Field label="Product ID (u32)">
              <input
                type="number"
                value={pid}
                onChange={(e) => setPid(Number(e.target.value) || 0)}
                className="w-full rounded-md border border-border bg-input px-3 py-1.5 font-mono text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>

            <Field label="Admin G-address">
              <input
                value={admin}
                onChange={(e) => setAdmin(e.target.value.trim())}
                className="w-full rounded-md border border-border bg-input px-3 py-1.5 font-mono text-[11px] focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-md border border-accent/30 bg-accent/[0.06] px-3 py-2">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-accent">
                Soroban v22 · Rust 2024
              </span>
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              forbid(unsafe_code)
            </span>
          </div>
        </div>
      </aside>

      {/* Output */}
      <section className="lg:col-span-8">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              src/lib.rs
            </span>
            <CopyButton value={lib} label="copy" />
          </div>
          <pre className="max-h-[640px] overflow-auto p-4 text-[12.5px] leading-relaxed">
            <code className="font-mono">{lib}</code>
          </pre>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Cargo.toml
            </span>
            <CopyButton value={cargo} label="copy" />
          </div>
          <pre className="overflow-auto p-4 text-[12.5px] leading-relaxed">
            <code className="font-mono">{cargo}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
