from fastapi import FastAPI
import subprocess
import json
import re

app = FastAPI()

CONTRACT_ID = "ISI_DENGAN_CONTRACT_ID_KAMU"

PID_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")
ISSUER_PUBKEY_PATTERN = re.compile(r"^[A-Za-z0-9]{16,128}$")
SIGNATURE_PATTERN = re.compile(r"^[A-Za-z0-9+/=]{16,1024}$")
CHIP_UID_PATTERN = re.compile(r"^[A-Fa-f0-9:-]{1,128}$")

@app.get("/")
def root():
return {"status": "RWA Verification API LIVE"}

@app.post("/verify")
def verify(data: dict):
 alert-autofix-307
    try:
        pid = data.get("pid")
        issuer_pubkey = data.get("issuer_pubkey")
        signature = data.get("signature")
        chip_uid = data.get("chip_uid")

        if not isinstance(pid, str) or not PID_PATTERN.fullmatch(pid):
            raise ValueError("Invalid pid format")
        if not isinstance(issuer_pubkey, str) or not ISSUER_PUBKEY_PATTERN.fullmatch(issuer_pubkey):
            raise ValueError("Invalid issuer_pubkey format")
        if not isinstance(signature, str) or not SIGNATURE_PATTERN.fullmatch(signature):
            raise ValueError("Invalid signature format")
        if not isinstance(chip_uid, str) or not CHIP_UID_PATTERN.fullmatch(chip_uid):
            raise ValueError("Invalid chip_uid format")

        cmd = [
            "soroban", "contract", "invoke",
            "--id", CONTRACT_ID,
            "--network", "testnet",
            "--source", "alice",
            "--",
            "verify",
            "--pid", pid,
            "--issuer_pubkey", issuer_pubkey,
            "--signature", signature,
            "--chip_uid", chip_uid
        ]

        result = subprocess.check_output(cmd).decode()

        return {
            "status": "success",
            "onchain_result": result
        }

    except Exception as e:
        return {"error": str(e)}

try:
pid = data.get("pid")
issuer_pubkey = data.get("issuer_pubkey")
signature = data.get("signature")
chip_uid = data.get("chip_uid")

if not isinstance(pid, str) or not PID_PATTERN.fullmatch(pid):
raise ValueError("Invalid pid format")
if not isinstance(issuer_pubkey, str) or not ISSUER_PUBKEY_PATTERN.fullmatch(issuer_pubkey):
raise ValueError("Invalid issuer_pubkey format")
if not isinstance(signature, str) or not SIGNATURE_PATTERN.fullmatch(signature):
raise ValueError("Invalid signature format")
if not isinstance(chip_uid, str) or not CHIP_UID_PATTERN.fullmatch(chip_uid):
raise ValueError("Invalid chip_uid format")

cmd = [
"soroban", "contract", "invoke",
"--id", CONTRACT_ID,
"--network", "testnet",
"--source", "alice",
"--",
"verify",
"--pid", pid,
"--issuer_pubkey", issuer_pubkey,
"--signature", signature,
"--chip_uid", chip_uid
]

result = subprocess.check_output(cmd).decode()

return {
"status": "success",
"onchain_result": result
}

except Exception as e:
return {"error": str(e)}
 main
