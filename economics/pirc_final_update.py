import os
import json

# --- 1. DEFINE THE 7 LAYERS (PiRC-207) ---
LAYERS = {
    "purple": {"name": "PurpleMain", "sym": "π-PURPLE", "val": 1, "desc": "Main Mined Currency (10M micro = 1 Pi)"},
    "gold":   {"name": "Gold314159", "sym": "π-GOLD", "val": 314159, "desc": "GCV Anchor Layer (10 GCV = 1 Mined Pi)"},
    "yellow": {"name": "Yellow31141", "sym": "π-YELLOW", "val": 31141, "desc": "Power & Energy Utility"},
    "orange": {"name": "Orange3141", "sym": "π-ORANGE", "val": 3141, "desc": "Creative & Community Flow"},
    "blue":   {"name": "Blue314", "sym": "π-BLUE", "val": 314, "desc": "Banking & Institutional Settlement"},
    "green":  {"name": "Green314", "sym": "π-GREEN", "val": 3.14, "desc": "PiCash Retail Utility"},
    "red":    {"name": "RedGov", "sym": "π-RED", "val": 1, "desc": "Governance & Voting Weight"},
}

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())

# --- 2. RUST SMART CONTRACT (SOROBAN STANDARD) ---
def generate_contract(name, symbol):
    return f"""
#![no_std]
use soroban_sdk::{{contract, contractimpl, Address, Env, String, symbol_short, log}};

#[contract]
pub struct {name}Token;

#[contractimpl]
impl {name}Token {{
    pub fn initialize(env: Env, admin: Address) {{
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        log!(&env, "PiRC-207 {symbol} Layer Activated");
    }}
    pub fn name(env: Env) -> String {{ String::from_slice(&env, "{name} Pi Layer") }}
    pub fn symbol(env: Env) -> String {{ String::from_slice(&env, "{symbol}") }}
    pub fn decimals(env: Env) -> u32 {{ 8 }}
}}
"""

def generate_cargo(name):
    return f"""
[package]
name = "{name.lower()}_token"
version = "2.0.0"
edition = "2021"
[lib]
crate-type = ["cdylib"]
[dependencies]
soroban-sdk = "20.0.0"
"""

# --- EXECUTION ---
for key, info in LAYERS.items():
    base = f"contracts/soroban/pirc-207-{key}-token"
    write_file(f"{base}/src/lib.rs", generate_contract(info["name"], info["sym"]))
    write_file(f"{base}/Cargo.toml", generate_cargo(info["name"]))

write_file("docs/PiRC-207-Technical-Standard.md", "# PiRC-207 Technical Standard\\n\\n1 Mined Pi = 10 GCV Units.")
write_file("schemas/pirc207_layers.json", json.dumps(LAYERS, indent=2))

print("Upgrade process finished.")
