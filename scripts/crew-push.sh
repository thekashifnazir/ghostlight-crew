#!/bin/sh
# Push the Crew's night commits in ghostlight-crew to GitHub (run by ghostlight-crew-push.service).
# 17 Nov: a plain `git pull --rebase` hit a draft clash on 15 Nov, stopped mid-rebase, and every later
# push failed quietly for two nights. Now: clear a stuck rebase, autostash, and on a clash push the
# night's commits to a side branch on GitHub (crew/unmerged-<date>) so nothing is lost or hidden.
set -u
cd "${1:-$HOME/ghostlight-crew}" || exit 1
export GIT_TERMINAL_PROMPT=0
log(){ echo "crew-push: $*"; }
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
  log "a rebase was left stopped; aborting it first"
  git rebase --abort 2>/dev/null || { log "abort failed; removing the stale rebase folder"; rm -rf .git/rebase-merge .git/rebase-apply; }
fi
if git pull --rebase --autostash -q origin main; then
  git push -q origin main && { log "pushed $(git rev-parse --short HEAD)"; exit 0; }
  log "push failed"; exit 1
fi
log "rebase clashed with GitHub; aborting and keeping the night's commits"
git rebase --abort 2>/dev/null
side="crew/unmerged-$(date -u +%Y%m%d-%H%M)"
git push -q origin "HEAD:refs/heads/$side" && log "night commits pushed to side branch $side for a human to merge"
exit 1
