#!/bin/bash
git checkout -B lovable-sync
git add .
git commit -m "sync: Lovable bidirectional integration" || true
git push origin lovable-sync || true
echo "Lovable sync branch ready. Connect repo in Lovable UI."
