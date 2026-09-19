# [#!/bin/bash
################################################################################
# PiRC v3.1.0 - Smart Fully Automated Release Script (Robust Version)
# Automatically handles: stash, pull, conflicts, commit, push, tag, release
################################################################################
set -euo pipefail

REPO="Ze0ro99/PiRC"
VERSION="v3.1.0"
BRANCH="main"
RELEASE_TITLE="PiRC v3.1.0 – Professional Sovereign Infrastructure Release"

RELEASE_NOTES_CONTENT="# PiRC v3.1.0 – Professional Sovereign Infrastructure Release

**Release Date:** July 3, 2026

## Overview
This release represents the **Professional PiRC v3.1** milestone. It focuses on production-ready deployment automation, robust state synchronization, frontend integration, and comprehensive security & dependency maintenance across the entire Sovereign Matrix architecture.

## Highlights
- Production-grade deployment orchestration and state synchronization
- Enhanced React/Vite frontend integration
- Extensive dependency updates and security hardening
- Critical routing and Stellar ecosystem fixes
- Continued evolution toward full EU MiCAR & post-quantum compliance

## Changes Since v2.1.0

### Infrastructure & Deployment
- Major improvements to deployment automation and state synchronization mechanisms
- Ultimate PiRC deployment workflow with frontend integration
- Automated master synchronization and network configuration across branches

### Bug Fixes
- Fixed 404 routing issues
- Resolved Stellar federation anchor binding for PiDEX compatibility

### Dependencies & Security
- Multiple dependency bumps via Dependabot (including \`aws-actions/configure-aws-credentials\`, \`stellar-xdr\`, Vite, and web dependencies group)
- Ongoing security maintenance through pre-commit hooks and CI/CD pipelines

### Maintenance & Automation
- Automated synchronization scripts and chore updates
- Continuous integration improvements and deployment guardrails

## Technical Notes
- The project continues to enforce \`#![forbid(unsafe_code)]\` in Rust/Soroban contracts
- 7-Layer execution model remains the core architectural foundation
- Full infrastructure is now considered production-ready for professional use cases

## Upgrade Notes
No breaking changes introduced in this release. Existing deployments should continue to function normally after updating dependencies.

---

**Full infrastructure ready. Professional PiRC v3.1 achieved.**"

CHANGELOG_FILE="CHANGELOG.md"
RELEASE_NOTES_FILE="RELEASE_NOTES_v3.1.0.md"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()    { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"; }
success(){ echo -e "${GREEN}✅ $1${NC}"; }
warn()   { echo -e "${YELLOW}⚠️  $1${NC}"; }
error()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     PiRC v3.1.0 - Smart Automated Release Script           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"

# 1. Check if inside git repo
if [ ! -d ".git" ]; then
    error "Please run from inside the PiRC folder: cd ~/PiRC"
fi

# 2. Set gh default repo
gh repo set-default "$REPO" 2>/dev/null || true

# 3. Handle unstaged changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    warn "Unstaged changes detected. Stashing them..."
    git stash push -m "Auto-stash before v3.1.0 release" || true
    STASHED=true
else
    STASHED=false
fi

# 4. Pull latest changes
log "Pulling latest changes from remote..."
git fetch origin
if git pull --rebase origin "$BRANCH"; then
    success "Pull successful"
else
    warn "Rebase had issues. Trying to resolve automatically..."
    git rebase --abort 2>/dev/null || true
    git pull --no-rebase origin "$BRANCH" || true
fi

# 5. Restore stashed changes
if [ "$STASHED" = true ]; then
    log "Restoring stashed changes..."
    if git stash pop; then
        success "Stash restored"
    else
        warn "Conflict detected after stash pop. Auto-resolving by accepting remote version..."
        git checkout --theirs . 2>/dev/null || true
        git add -A
        git commit -m "chore: auto-resolve conflicts for v3.1.0 release" || true
    fi
fi

# 6. Create release files
log "Creating release files..."
cat > "$RELEASE_NOTES_FILE" << 'EOF'
'"$RELEASE_NOTES_CONTENT"'
EOF

{
    echo "# Changelog"
    echo ""
    echo "## [$VERSION] - $(date +%Y-%m-%d)"
    echo ""
    echo "$RELEASE_NOTES_CONTENT"
    if [ -f "$CHANGELOG_FILE" ]; then
        tail -n +2 "$CHANGELOG_FILE" 2>/dev/null || true
    fi
} > CHANGELOG.tmp && mv CHANGELOG.tmp "$CHANGELOG_FILE"

success "Release files created"

# 7. Commit all changes
git add -A
if ! git diff --cached --quiet; then
    git commit -m "chore(release): v3.1.0 - Professional Sovereign Infrastructure Release

- Updated CHANGELOG and release notes
- Full infrastructure ready"
    success "Commit created"
else
    warn "No new changes to commit"
fi

# 8. Push code
log "Pushing to GitHub..."
git push origin "$BRANCH"
success "Code pushed"

# 9. Create and push tag
if ! git tag -l | grep -q "$VERSION"; then
    git tag -a "$VERSION" -m "Release $VERSION - Professional PiRC v3.1.0"
    git push origin "$VERSION"
    success "Tag $VERSION created and pushed"
else
    warn "Tag already exists"
fi

# 10. Create GitHub Release
log "Creating GitHub Release..."
gh release create "$VERSION" \
    --repo "$REPO" \
    --title "$RELEASE_TITLE" \
    --notes-file "$RELEASE_NOTES_FILE" \
    --latest

success "GitHub Release created successfully!"

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉 PiRC v3.1.0 Release Completed Successfully!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e "View it here: https://github.com/${REPO}/releases/tag/${VERSION}\n"]
