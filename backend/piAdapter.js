import crypto from "crypto";

// 🔐 Simulasi Pi Auth Verification (replace with real Pi SDK verify)
export function verifyPiUser(piToken) {
  if (!piToken || piToken.length < 10) {
    return null;
  }

  // mock decode
  return {
    uid: "pi_user_" + piToken.slice(0, 6),
    wallet: "G_PI_" + crypto.randomBytes(8).toString("hex")
  };
}

// 🔄 Convert Pi Request → Internal Payload
export function mapPiToInternal(piUser, body) {
  return {
    asset_id: body.asset_id,
    owner: piUser.wallet,
    amount: body.amount || 100,
    mode: body.mode || "pi"
  };
}

// 📤 Standard Response ke Pi App
export function formatPiResponse(result) {
  return {
    success: true,
    data: result
  };
}
