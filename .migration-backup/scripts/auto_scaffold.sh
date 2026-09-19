#!/bin/bash
mkdir -p src/services src/api
for doc in $(find docs -name "*.md" 2>/dev/null); do base=$(basename "$doc" .md); touch "src/api/${base}_integration.ts" 2>/dev/null || true; done
for sc in $(find contracts -name "*.sol" 2>/dev/null); do base=$(basename "$sc" .sol); touch "src/services/${base}Service.ts" 2>/dev/null || true; done
