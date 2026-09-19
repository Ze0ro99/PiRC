#!/data/data/com.termux/files/usr/bin/bash

# PiRC Platform - Termux Environment setup

echo -e "\e[32m[PiRC] Starting environment setup for Android via Termux...\e[0m"

# 1. Update and Upgrade packages
echo -e "\e[34m[1/6] Updating package repositories...\e[0m"
pkg update -y && pkg upgrade -y

# 2. Install Node.js, git, and build tools
echo -e "\e[34m[2/6] Installing Node.js, git and python (for compiling modules)...\e[0m"
pkg install -y nodejs git build-essential python

# 3. Clone Repository
echo -e "\e[34m[3/6] Fetching PiRC Alpha Hub repository...\e[0m"
if [ ! -d "PiRC" ]; then
    git clone https://github.com/ze0ro99/PiRC.git
    cd PiRC
else
    echo -e "\e[33mDirectory 'PiRC' already exists. Pulling latest changes...\e[0m"
    cd PiRC
    git pull origin main || git pull origin master
fi

# 4. Install Dependencies
echo -e "\e[34m[4/6] Installing required NPM packages...\e[0m"
npm install --no-fund --no-audit

# 5. Build for Production (Optional optimization but ensures all artifacts are compiled)
echo -e "\e[34m[5/6] Ensuring project builds successfully...\e[0m"
npm run build

# 6. Success Output
echo -e "\e[32m[6/6] Setup complete!\e[0m"
echo -e "\e[36m========================================================\e[0m"
echo -e "Your PiRC node is ready to be launched."
echo -e "You can start the unified gateway with:"
echo -e "\n   \e[32mnpm run dev\e[0m"
echo -e "\nNavigate to \e[34mhttp://localhost:3000\e[0m in your browser once started."
echo -e "\e[36m========================================================\e[0m"
