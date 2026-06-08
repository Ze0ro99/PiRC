export const PI_RC_RAW_BASE = 'https://raw.githubusercontent.com/Ze0ro99/PiRC/main';
export const PI_TESTNET_RPC = 'https://rpc.testnet.minepi.com'; // Official Pi Testnet RPC

export async function fetchPiRCData() {
  const [registry, layers, manifest, matrix] = await Promise.all([
    fetch(`${PI_RC_RAW_BASE}/CONTRACTS_REGISTRY.json`).then(r => r.json()).catch(() => ({})),
    fetch(`${PI_RC_RAW_BASE}/7_layer_packets.json`).then(r => r.json()).catch(() => ({})),
    fetch(`${PI_RC_RAW_BASE}/sovereign_manifest.json`).then(r => r.json()).catch(() => ({})),
    fetch(`${PI_RC_RAW_BASE}/LIVE_MATRIX_REGISTRY.csv`).then(r => r.text()).catch(() => '')
  ]);
  return { registry, layers, manifest, matrixRaw: matrix, timestamp: new Date().toISOString() };
}
