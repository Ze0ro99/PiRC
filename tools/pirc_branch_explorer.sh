#!/data/data/com.termux/files/usr/bin/bash
echo "=== PiRC Professional Branch Explorer ==="
echo "Current branch: $(git branch --show-current)"
echo ""
echo "=== All Local Branches ==="
git branch
echo ""
echo "=== Remote Branches (showing first 30) ==="
git branch -r | head -30
echo ""
echo "To checkout a branch: git checkout <branch-name>"
