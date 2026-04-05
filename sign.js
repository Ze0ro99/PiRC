import nacl from "tweetnacl";

export function signPayload(payload, secretKey) {
  const message = Buffer.from(JSON.stringify(payload));

  const signature = nacl.sign.detached(
    message,
    Buffer.from(secretKey, "hex")
  );

  return Buffer.from(signature).toString("hex");
}
