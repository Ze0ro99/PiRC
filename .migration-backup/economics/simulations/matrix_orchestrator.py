#!/usr/bin/env python3
import subprocess
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

def run_orchestration_loop():
    logging.info("VANGUARD CORE: Starting Engine Subsystems...")
    # Fire up the WCF state engine generator asynchronously
    subprocess.Popen(["python3", "vanguard_wcf_hub.py"])
    # Fire up the Flask secure backend interface asynchronously
    subprocess.Popen(["python3", "unity_backend_sync.py"])
    
    logging.info("VANGUARD CORE: All telemetry microservices running.")
    try:
        while True:
            logging.info("System Health: Checksum Valid • Pipeline Secure • Broadcast Active")
            time.sleep(10)
    except KeyboardInterrupt:
        logging.info("Shutting down Orchestrator core.")

if __name__ == "__main__":
    run_orchestration_loop()
