#!/usr/bin/env bash
set -euo pipefail

# Git Safe Workflow (beginner-friendly)
# - Checks clean working tree
# - Pulls remote using rebase when possible
# - Stages all local changes
# - Prompts for commit message (or uses one provided)
# - Pushes to the appropriate upstream branch
#
# Usage:
#   ./git-safe-workflow.sh            # will prompt for commit message
#   ./git-safe-workflow.sh "msg"     # uses provided message

MSG="${1:-}"

info() { printf "\n[INFO] %s\n" "$*"; }
warn() { printf "\n[WARN] %s\n" "$*" >&2; }
err()  { printf "\n[ERROR] %s\n" "$*" >&2; }

require_git() {
  command -v git >/dev/null 2>&1 || { err "git is not installed"; exit 1; }
}

require_git

# Ensure we're in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err "Not inside a Git repository."
  exit 1
fi

# Determine current branch
BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  err "You are on a detached HEAD. Please checkout a branch first."
  exit 1
fi

info "Current branch: $BRANCH"

# Check remote tracking branch
UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>/dev/null || true)"
if [[ -z "$UPSTREAM" ]]; then
  warn "No upstream tracking branch set for $BRANCH."
  warn "Run: git push -u origin $BRANCH"
  exit 1
fi
info "Upstream: $UPSTREAM"

# Working tree checks
if [[ -n "$(git status --porcelain)" ]]; then
  err "You have uncommitted changes. Commit/stash them first."
  git status
  exit 1
fi

# Fetch latest refs
info "Fetching from remote(s)..."
# Use origin by default if it exists; otherwise, fetch all remotes
if git remote get-url origin >/dev/null 2>&1; then
  git fetch origin --prune
else
  git fetch --all --prune
fi

# Pull with rebase if possible
# We'll try: git pull --rebase. If it fails, we stop with instructions.
info "Pulling latest changes (prefer rebase)..."
set +e
PULL_OUT=$(git pull --rebase 2>&1)
PULL_CODE=$?
set -e

if [[ $PULL_CODE -ne 0 ]]; then
  err "Rebase/pull failed (likely conflicts)."
  warn "Git output:\n$PULL_OUT"
  warn "Resolve conflicts, then run: git rebase --continue"
  warn "If you want to abort: git rebase --abort"
  exit $PULL_CODE
fi

# Stage everything (after successful pull/rebase)
# Note: there should still be no uncommitted changes per earlier check.
# But if your flow requires adding after pull, uncomment next two lines.
#
# info "Staging all local changes..."
# git add -A

# If nothing to commit, exit cleanly.
if git diff --cached --quiet && git diff --quiet; then
  info "No local changes detected. Nothing to commit."
  info "Attempting push..."
fi

# Stage all (now, in case user modified files after initial clean check)
info "Staging all local changes (if any)..."
git add -A

# If there's nothing staged/changed, skip commit
if git diff --cached --quiet; then
  info "No staged changes. Skipping commit."
else
  if [[ -z "$MSG" ]]; then
    echo
    read -r -p "Enter commit message: " MSG
  fi
  if [[ -z "$MSG" ]]; then
    err "Empty commit message."
    exit 1
  fi

  info "Creating commit..."
  git commit -m "$MSG"
fi

# Push to origin and johkimani
info "Pushing to origin ($BRANCH)..."
git push origin "$BRANCH"

if git remote get-url johkimani >/dev/null 2>&1; then
  info "Pushing to johkimani ($BRANCH)..."
  git push johkimani "$BRANCH" || warn "Failed to push to johkimani"
fi

info "Done."


