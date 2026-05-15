import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("⚡ Starting Automated ESM Data Seeding...");
const liveDataPath = path.join(__dirname, "../data/live/state.json");

const initialState = {
  initializedAt: new Date().toISOString(),
  status: "SYSTEM_ONLINE",
  verifications: 0,
  active_connections: 3,
  data_stream: "active",
};

fs.writeFileSync(liveDataPath, JSON.stringify(initialState, null, 2));
console.log("✅ Live State Seeded Successfully.");
