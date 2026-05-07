#!/bin/bash
set -e

# ==============================================================================
# 🚀 PiRC Ecosystem - Advanced Vercel Deployer (Termux SSH Optimized)
# ==============================================================================

PROJECT_ID="prj_aKztIx5lI760620faCZ1hTXtQeoZ"
GITHUB_USER="Ze0ro99"
REPO_NAME="PiRC"
REPO_SSH="git@github.com:$GITHUB_USER/$REPO_NAME.git"

echo "🔄 [1/7] Updating Termux & Installing Dependencies..."
pkg update -y && pkg upgrade -y
pkg install nodejs git openssh jq -y

echo "🔐 [2/7] Configuring GitHub SSH Authentication..."
if [ ! -f "$HOME/.ssh/id_ed25519" ]; then
    echo "-> Generating new SSH key for GitHub..."
    ssh-keygen -t ed25519 -C "termux-deployer" -N "" -f "$HOME/.ssh/id_ed25519"
    eval "$(ssh-agent -s)"
    ssh-add "$HOME/.ssh/id_ed25519"
    
    echo "=========================================================================="
    echo "⚠️  CRITICAL SSH STEP REQUIRED! ⚠️"
    echo "Copy the SSH Key below and add it to GitHub (https://github.com/settings/keys):"
    echo "--------------------------------------------------------------------------"
    cat "$HOME/.ssh/id_ed25519.pub"
    echo "--------------------------------------------------------------------------"
    echo "Once you have added the key to GitHub, press [ENTER] to continue..."
    read -r
else
    echo "-> SSH key already exists. Ensuring SSH agent is running..."
    eval "$(ssh-agent -s)" > /dev/null
    ssh-add "$HOME/.ssh/id_ed25519" 2>/dev/null || true
fi

# Ensure GitHub is in known hosts
mkdir -p "$HOME/.ssh"
ssh-keyscan github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null

echo "📦 [3/7] Cloning or Updating PiRC Repository via SSH..."
cd "$HOME"
if [ -d "$REPO_NAME" ]; then
    echo "-> Directory exists. Pulling latest changes..."
    cd "$REPO_NAME"
    git fetch origin
    git reset --hard origin/main || git reset --hard origin/master
else
    echo "-> Cloning repository via SSH..."
    git clone "$REPO_SSH"
    cd "$REPO_NAME"
fi

echo "🔌 [4/7] Installing Vercel CLI Globally..."
npm install -g vercel --silent

echo "🔑 [5/7] Vercel Authentication setup..."
echo "You need a Vercel Token to deploy from Termux."
echo "Get it here: https://vercel.com/account/tokens"
read -p "Paste your Vercel Token here (Text hidden): " -s VERCEL_TOKEN
echo ""
export VERCEL_TOKEN="$VERCEL_TOKEN"

echo "-> Linking the specific Vercel Project ($PROJECT_ID)..."
vercel link --yes --token "$VERCEL_TOKEN"

echo "🛡️ [6/7] Securing the Pi API Key..."
echo "Enter your PI_API_KEY (Text hidden): "
read -p "PI_API_KEY: " -s PI_KEY
echo ""

if [ ! -z "$PI_KEY" ]; then
    echo "-> Uploading Pi API Key to Vercel Environment Variables..."
    # Pipe the key to vercel env add command securely
    echo "$PI_KEY" | vercel env add PI_API_KEY production --token "$VERCEL_TOKEN" || echo "API Key might already be set. Continuing..."
else
    echo "⚠️  No PI_API_KEY entered! Payments will fail in production!"
fi

echo "🚀 [7/7] Launching Vercel Production Build..."
# Build and deploy straight to Vercel production Edge Network
vercel deploy --prod --yes --token "$VERCEL_TOKEN"

echo "=========================================================================="
echo "✅ VERCEL DEPLOYMENT COMPLETE!"
echo "Your PiRC Repository has been successfully synced and deployed."
echo "=========================================================================="
