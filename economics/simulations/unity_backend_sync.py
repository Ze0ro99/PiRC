#!/usr/bin/env python3
"""
Project Unity Sphere - Secured Economic Backend Sync Interface
Author: Ze0ro99 / Muhammad Kamel Qadah
Description: Restructured JSON payload to match packet requirements and integrity checks.
"""

import os
import json
import logging
import hashlib
from flask import Flask, jsonify, make_response

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
app = Flask(__name__)
MANIFEST_PATH = "sovereign_manifest.json"

# Hardware/System hidden salt for payload integrity validation
SYSTEM_SALT = b"PiRC-101-SECURE-TRANSPORT-SALT-2026"

def generate_payload_signature(data_dict):
    """Generates a deterministic SHA-256 hash checksum of the core economic packet."""
    serialized = json.dumps(data_dict, sort_keys=True).encode('utf-8')
    return hashlib.sha256(serialized + SYSTEM_SALT).hexdigest()

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Matrix-Signature'
    response.headers['Access-Control-Allow-Methods'] = 'GET,OPTIONS'
    return response

@app.route('/api/v1/telemetry/live', methods=['GET'])
def get_live_telemetry():
    if not os.path.exists(MANIFEST_PATH):
        return add_cors_headers(make_response(jsonify({"status": "ERROR", "message": "Sovereign manifest offline"}), 503))
        
    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)
        
    # Strictly structure the inner packet exactly as expected by vanguard_dashboard.html
    core_payload = {
        "ecosystem_standard": "PiRC-101",
        "system_time": manifest.get("telemetry_engine", {}).get("last_updated"),
        "telemetry": manifest.get("telemetry_engine", {}).get("metrics", {}),
        "algorithmic_core": manifest.get("telemetry_engine", {}).get("algorithmic_wcf", {})
    }
    
    # Generate the cryptographic signature over the structured packet
    payload_signature = generate_payload_signature(core_payload)
    
    # Final Response Wrapper matching frontend layout bindings
    sync_payload = {
        "status": "SUCCESS",
        "integrity_proof": payload_signature,
        "packet": core_payload
    }
    
    logging.info(f"VANGUARD SECURE API: Dispatched verified block [{payload_signature[:8]}...]")
    response = make_response(jsonify(sync_payload), 200)
    return add_cors_headers(response)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)
