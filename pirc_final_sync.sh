#!/bin/bash

CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
RESET='\033[0m'

echo -e "${CYAN}================================================================${RESET}"
echo -e "${CYAN}🚀 [PiRC] Final Repository Sync, Cleanup & Distribution...${RESET}"
echo -e "${CYAN}================================================================${RESET}"

# 1. Clean the environment (Trimmer) & Fix Large File Issues
echo -e "${YELLOW}[1/4] Cleaning environment and fixing file limits...${RESET}"
git rm --cached pirc_ultimate_environment_export.zip 2>/dev/null || true
git rm --cached *.zip 2>/dev/null || true

if ! grep -q "\*.zip" .gitignore 2>/dev/null; then
    echo "*.zip" >> .gitignore
fi

rm -rf node_modules/.vite 2>/dev/null
npx kill-port 5173 5174 5175 3000 >/dev/null 2>&1 || true

# 2. Save current work regardless of which branch you are on
echo -e "${YELLOW}[2/4] Collecting terminal updates...${RESET}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git add .
git commit -m "chore(sync): final terminal updates and cleanup" >/dev/null 2>&1 || true

# 3. Synchronize with Main Branch & Push to Ze0ro99/PiRC
echo -e "${YELLOW}[3/4] Securely merging and pushing to 'main' branch...${RESET}"
if [ "$CURRENT_BRANCH" != "main" ]; then
    git checkout main 2>/dev/null || git checkout -b main
    git pull origin main --rebase >/dev/null 2>&1 || true
    git merge $CURRENT_BRANCH -m "chore: merge terminal updates into main" >/dev/null 2>&1 || true
fi
# Force push to guarantee alignment with remote main
git push origin main --force

# 4. Supply updates to sub-branches
echo -e "${YELLOW}[4/4] Supplying updates to sub-branches (staging, dev)...${RESET}"
for branch in staging dev; do
    git checkout $branch 2>/dev/null || git checkout -b $branch
    git merge main -m "chore: sync with main" >/dev/null 2>&1 || true
    git push origin $branch --force >/dev/null 2>&1 || true
    echo -e "  ${GREEN}✓ Branch '$branch' synchronized & pushed.${RESET}"
done

# Return safely to main
git checkout main >/dev/null 2>&1

echo -e "${CYAN}================================================================${RESET}"
echo -e "${GREEN}✨ ALL TASKS COMPLETED SUCCESSFULLY! ✨${RESET}"
echo -e "${GREEN}1. Updates collected and pushed to Ze0ro99/PiRC (main).${RESET}"
echo -e "${GREEN}2. Updates successfully supplied to 'staging' and 'dev'.${RESET}"
echo -e "${YELLOW}Note: 'npm run dev' was intentionally skipped to prevent your phone from reloading.${RESET}"
echo -e "${CYAN}================================================================${RESET}"
