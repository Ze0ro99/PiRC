#!/data/data/com.termux/files/usr/bin/bash
# === PiRC Automatic Sync & Push Tool ===
echo "=== PiRC Auto Sync & Push ==="

# Pull latest changes
echo "Pulling latest changes from remote..."
git pull --rebase origin $(git branch --show-current) || echo "Pull completed with conflicts (check manually)"

# Show status
git status

# Ask for commit message if there are changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "There are changes to commit."
    read -p "Enter commit message: " msg
    if [ -z "$msg" ]; then msg="Auto update: $(date +%Y-%m-%d_%H-%M)"; fi
    git add .
    git commit -m "$msg"
fi

# Push
echo "Pushing to remote..."
git push origin $(git branch --show-current) && echo "✅ Push successful!" || echo "❌ Push failed. Check connection."

echo "Operation completed."
