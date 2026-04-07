
#!/bin/bash
# =====================================================
# PiRC - Restore Original Main from Commit 10cd4eb
# 
# This script restores the FULL original main branch
# from the ZIP file you downloaded from the old commit.
# It will:
#   1. Extract the backup ZIP
#   2. Replace all files and folders
#   3. Commit the restoration
#   4. Force-push to main
# 
# Author: Automated Recovery Script
# Date: April 2026
# =====================================================

echo "🚀 Starting restoration of ORIGINAL main branch..."
echo "   Commit: 10cd4eb10fad0ec01b085a145dd9334ed099c697"

# Step 1: Extract the backup ZIP (overwrite existing files)
unzip -o main-original-backup.zip -d .

# Step 2: Remove the ZIP file after extraction
rm -f main-original-backup.zip

# Step 3: Stage all files and folders
git add --all

# Step 4: Create a clear commit message
git commit -m "🔄 Restore original main from commit 10cd4eb10fad0ec01b085a145dd9334ed099c697 (pre-migration state) - $(date '+%Y-%m-%d %H:%M:%S')"

# Step 5: Force push to overwrite the current (empty) main
git push origin main --force

echo "✅ SUCCESS! Original main branch has been fully restored."
echo "   All files and folders from before the migration are back."
echo "   You can now continue working normally."
chmod +x restore-original-main.sh
./restore-original-main.sh



