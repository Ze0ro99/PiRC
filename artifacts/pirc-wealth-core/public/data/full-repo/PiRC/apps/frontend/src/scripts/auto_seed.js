import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const liveDataPath = path.join(__dirname, "../data/live/state.json");

const state = {
  initializedAt: new Date().toISOString(),
  status: "SYSTEM_ONLINE",
  connections: 3,
};
fs.writeFileSync(liveDataPath, JSON.stringify(state, null, 2));
console.log("✅ Live State Seeded Successfully.");
