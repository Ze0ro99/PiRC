#!/data/data/com.termux/files/usr/bin/bash
echo "=== Professional SSH Push Helper ==="
git status
echo ""
read -p "Enter commit message: " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Update: $(date +%Y-%m-%d)"
fi

git add .
if git commit -m "$commit_msg"; then
    echo "Pushing to origin..."
    if git push origin "$(git branch --show-current)"; then
        echo "✅ Push successful!"
    else
        echo "❌ Push failed. Check SSH key and permissions."
    fi
else
    echo "No changes to commit."
fi
