from fastapi import FastAPI
import subprocess
import json
import re

app = FastAPI()

CONTRACT_ID = "ISI_DENGAN_CONTRACT_ID_KAMU"

@app.get("/")
def root():
    return {"status": "RWA Verification API LIVE"}

@app.post("/verify")
def verify(data: dict):
    try:
        required_fields = ["pid", "issuer_pubkey", "signature", "chip_uid"]
        for field in required_fields:
            if field not in data or not isinstance(data[field], str):
                return {"error": f"Invalid or missing field: {field}"}

        pid = data["pid"].strip()
        issuer_pubkey = data["issuer_pubkey"].strip()
        signature = data["signature"].strip()
        chip_uid = data["chip_uid"].strip()

        if not re.fullmatch(r"[A-Za-z0-9._:-]{1,64}", pid):
            return {"error": "Invalid pid format"}
        if not re.fullmatch(r"[A-Za-z0-9+/=:_-]{16,256}", issuer_pubkey):
            return {"error": "Invalid issuer_pubkey format"}
        if not re.fullmatch(r"[A-Za-z0-9+/=:_-]{16,512}", signature):
            return {"error": "Invalid signature format"}
        if not re.fullmatch(r"[A-Za-z0-9._:-]{1,128}", chip_uid):
            return {"error": "Invalid chip_uid format"}

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
