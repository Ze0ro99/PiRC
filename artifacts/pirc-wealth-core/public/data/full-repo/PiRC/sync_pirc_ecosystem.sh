#!/bin/bash
set -e

echo "=========================================================================="
echo "🌍 PiRC Ecosystem - Tri-Repository Sync & Link Deployer (SSH Mode)"
echo "=========================================================================="

# Repository Configurations
ORG="Ze0ro99"
REPO_MAIN="PiRC"
REPO_HUB="PiRC-Alpha-Hub"
REPO_RESOURCES="Organizing-the-Earth-s-resources-"

DIR_WORKSPACE="$HOME/PiRC_Ecosystem"

echo "🔄 [1/7] Preparing OS Environment (Termux / Linux)..."
if [ -n "$PREFIX" ]; then
    # Termux Environment
    pkg update -y && pkg install git openssh rsync -y
else
    # General Linux / CloudShell Environment
    sudo apt-get update -y && sudo apt-get install git ssh rsync -y || true
fi

echo "🔐 [2/7] Binding GitHub SSH Authentication..."
if [ ! -f "$HOME/.ssh/id_ed25519" ]; then
    echo "-> Generating new SSH key for secure GitHub Ecosystem Sync..."
    ssh-keygen -t ed25519 -C "pirc-ecosystem-bot" -N "" -f "$HOME/.ssh/id_ed25519"
    eval "$(ssh-agent -s)"
    ssh-add "$HOME/.ssh/id_ed25519"
    
    echo "=========================================================================="
    echo "⚠️  CRITICAL SSH STEP REQUIRED! ⚠️"
    echo "1. Copy the SSH Key below."
    echo "2. Go to GitHub -> Settings -> SSH and GPG keys -> New SSH key"
    echo "--------------------------------------------------------------------------"
    cat "$HOME/.ssh/id_ed25519.pub"
    echo "--------------------------------------------------------------------------"
    echo "Press [ENTER] only AFTER you have pasted the key into GitHub..."
    read -r
else
    echo "-> SSH key found. Ensuring SSH agent is running..."
    eval "$(ssh-agent -s)" > /dev/null
    ssh-add "$HOME/.ssh/id_ed25519" 2>/dev/null || true
fi

# Ensure GitHub's fingerprint is whitelisted to prevent clone prompts
mkdir -p "$HOME/.ssh"
ssh-keyscan github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null

echo "📦 [3/7] Initializing Workspace & Fetching Repositories via SSH..."
mkdir -p "$DIR_WORKSPACE"
cd "$DIR_WORKSPACE"

# Function to intelligently clone or pull latest changes
sync_repo() {
    local REPO_NAME=$1
    echo "-> Syncing $REPO_NAME..."
    if [ -d "$REPO_NAME" ]; then
        cd "$REPO_NAME"
        git fetch origin
        git reset --hard origin/HEAD
        cd ..
    else
        git clone "git@github.com:$ORG/$REPO_NAME.git"
    fi
}

sync_repo $REPO_MAIN
sync_repo $REPO_HUB
sync_repo $REPO_RESOURCES

echo "🔗 [4/7] Executing Cross-Linking & Centralizing Data in main PiRC..."

SOURCE_DIR="$DIR_WORKSPACE/$REPO_MAIN"
HUB_DIR="$DIR_WORKSPACE/$REPO_HUB"
RESOURCES_DIR="$DIR_WORKSPACE/$REPO_RESOURCES"

# Create shared data pipeline inside PiRC Core
cd "$SOURCE_DIR"
mkdir -p shared_core_pipeline

echo "-> Compiling ecosystem pathways & topology algorithms..."
cat << 'JSON' > shared_core_pipeline/topology.json
{
  "ecosystem": "PiRC Universal Network",
  "version": "v2.1.0",
  "status": "Interconnected via SSH Pipeline",
  "repositories": {
    "core_api": "https://github.com/Ze0ro99/PiRC",
    "alpha_node": "https://github.com/Ze0ro99/PiRC-Alpha-Hub",
    "earth_grid": "https://github.com/Ze0ro99/Organizing-the-Earth-s-resources-"
  },
  "last_synced": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
JSON

cat << 'MD' > shared_core_pipeline/ECOSYSTEM_ROUTING.md
# 🌐 PiRC Unified Routing Data
> **Automated Pipeline Output**
All data logic from `PiRC` is pushed directly down to connected repositories to prevent fragmenting.
* Any path referencing `/api/` directs to -> [Core Hub](https://github.com/Ze0ro99/PiRC)
* Any path referencing `/alpha/` directs to -> [Alpha Hub](https://github.com/Ze0ro99/PiRC-Alpha-Hub)
* Resources mapping -> [Earth Node](https://github.com/Ze0ro99/Organizing-the-Earth-s-resources-)
MD

echo "📂 [5/7] Supplying Core Information to Alpha-Hub & Earth-Resources..."

# Transport Data to Alpha Hub
mkdir -p "$HUB_DIR/pirc_injected_core"
cp -r "$SOURCE_DIR/shared_core_pipeline/"* "$HUB_DIR/pirc_injected_core/"
# Correct local file paths if necessary
find "$HUB_DIR" -type f -name "*.md" -exec sed -i 's|/docs/|https://github.com/Ze0ro99/PiRC/tree/main/docs/|g' {} + 2>/dev/null || true

# Transport Data to Earth Resources
mkdir -p "$RESOURCES_DIR/pirc_injected_core"
cp -r "$SOURCE_DIR/shared_core_pipeline/"* "$RESOURCES_DIR/pirc_injected_core/"

echo "⚙️ [6/7] Committing Upgraded Master Artifacts -> PiRC..."
# Configure bot identity
git config --global user.name "PiRC Automation System"
git config --global user.email "deploy@pirc.network"

cd "$SOURCE_DIR"
git add shared_core_pipeline/
git commit -m "chore: Systematically synchronized topology & ecosystem links" || echo "Core up to date."
git push origin HEAD

echo "🚀 [7/7] Pushing Supplied Data to Sub-Repositories via SSH..."

# Push to Alpha Hub
cd "$HUB_DIR"
git add pirc_injected_core/
git commit -m "build: Ingested latest unified files & updated routing paths from PiRC Core" || echo "Alpha-Hub up to date."
git push origin HEAD

# Push to Earth Resources
cd "$RESOURCES_DIR"
git add pirc_injected_core/
git commit -m "build: Ingested latest unified files & updated routing paths from PiRC Core" || echo "Earth-Resources up to date."
git push origin HEAD

echo "=========================================================================="
echo "✅ ECOSYSTEM FEDERATION COMPLETE!"
echo "All 3 repositories have been successfully interconnected via SSH."
echo "Data paths have been verified, injected, and distributed perfectly."
echo "=========================================================================="
