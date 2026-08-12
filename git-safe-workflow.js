#!/usr/bin/env node
/**
 * Safe Git workflow script (production-safe-ish, beginner-friendly)
 *
 * Steps:
 * 1) Validate inside git repo
 * 2) Check current branch
 * 3) Ensure upstream tracking exists
 * 4) Refuse to proceed if working tree has uncommitted changes
 * 5) git fetch
 * 6) git pull --rebase (stops if conflicts occur)
 * 7) git add -A
 * 8) commit (prompt for message if not provided)
 * 9) git push
 *
 * Usage:
 *   node git-safe-workflow.js                 # prompts for message if needed
 *   node git-safe-workflow.js "my commit"    # uses message
 */

import { execSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const MSG_ARG = process.argv[2] ?? '';

const run = (cmd, opts = {}) => {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
};

const runAllowFail = (cmd) => {
  try {
    const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
    return { ok: true, out: out.toString().trim(), code: 0 };
  } catch (e) {
    return {
      ok: false,
      code: e.status ?? 1,
      out: (e.stdout?.toString?.() ?? '') + (e.stderr?.toString?.() ?? ''),
    };
  }
};

const info = (s) => console.log(`\n[INFO] ${s}`);
const warn = (s) => console.warn(`\n[WARN] ${s}`);
const err = (s) => console.error(`\n[ERROR] ${s}`);

try {
  run('git rev-parse --is-inside-work-tree');
} catch {
  err('Not inside a Git repository.');
  process.exit(1);
}

// Ensure git exists
try {
  run('git --version');
} catch {
  err('git not installed or not available in PATH.');
  process.exit(1);
}

let branch = '';
try {
  branch = run('git branch --show-current');
} catch {}

if (!branch) {
  err('You are on detached HEAD. Checkout a branch first.');
  process.exit(1);
}
info(`Current branch: ${branch}`);

let upstream = '';
try {
  upstream = run('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
} catch {
  upstream = '';
}

if (!upstream) {
  warn('No upstream tracking branch set.');
  warn('Run: git push -u origin <branch>');
  process.exit(1);
}
info(`Upstream: ${upstream}`);

// Working tree clean check
const statusPorcelain = run('git status --porcelain');
if (statusPorcelain) {
  err('You have uncommitted changes. Commit/stash them first.');
  process.exit(1);
}

// Fetch
info('Fetching latest refs...');
try {
  // Prefer origin
  run('git remote get-url origin');
  run('git fetch origin --prune');
} catch {
  run('git fetch --all --prune');
}

// Pull with rebase
info('Pulling with rebase (conflicts stop the script)...');
const pullRes = runAllowFail('git pull --rebase');
if (!pullRes.ok) {
  err('git pull --rebase failed (likely conflicts).');
  warn(`Git output:\n${pullRes.out}`);
  warn('Resolve conflicts, then run: git rebase --continue');
  warn('Or abort: git rebase --abort');
  process.exit(pullRes.code);
}

// Stage all
info('Staging all local changes (if any)...');
run('git add -A');

const stagedDiff = runAllowFail('git diff --cached --quiet');
// exit code 0 => no diff staged; 1 => there is staged diff
const hasStaged = stagedDiff.ok ? false : true;

if (hasStaged) {
  let msg = MSG_ARG;
  if (!msg) {
    const rl = readline.createInterface({ input, output });
    msg = await rl.question('Enter commit message: ');
    rl.close();
  }

  if (!msg || !msg.trim()) {
    err('Empty commit message.');
    process.exit(1);
  }

  info('Creating commit...');
  run(`git commit -m ${JSON.stringify(msg.trim())}`);
} else {
  info('No staged changes. Skipping commit.');
}

// Push
info('Pushing to origin (shrewd-baddest)...');
run(`git push origin ${branch}`);

info('Pushing to johkimani...');
try {
  run(`git push johkimani ${branch}`);
} catch (e) {
  warn(`Failed to push to johkimani remote: ${e.message}`);
}

info('Done.');


