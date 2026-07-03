- [ ] Validate existing git-safe-workflow scripts cover the requested workflow (pull latest + safe rebase conflict handling)
- [ ] Create/repair a safe workflow helper for both Windows (PowerShell) and POSIX (bash/node) environments
- [ ] Add explicit guidance for conflicts: stop on rebase failure; user resolves; run rebase --continue/--abort; then re-run safe workflow
- [ ] Ensure script uses upstream tracking (origin/main or current branch) safely and refuses to run with uncommitted changes
- [ ] Final verification: run script dry checks (git status, branch, upstream) and ensure it does not auto-merge when conflicts occur

