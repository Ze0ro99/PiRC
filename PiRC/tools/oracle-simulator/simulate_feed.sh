#!/bin/bash
echo "[ORACLE] Broadcasting simulated price feed payload to PiRC Oracles..."
echo "{\"asset\": \"PI/USD\", \"price\": 31.41, \"timestamp\": $(date +%s)}"
echo "[ORACLE] Completed."
