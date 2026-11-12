#!/usr/bin/env bash
# listener.sh: the Crew "listener" bot. Runs the real-NVDA screen-reader check
# (ghostlight's scripts/sr-check.sh, both scenarios) against the live site in
# the Parallels VM "Ghostlight Win11", writes reports/listener-<date>-<HHMM>.md
# and commits only that report (no push). Zero tokens. Run it after each deploy:
#   kirocrew cron trigger <listener job id>     (Mac Crew; see listener-request.sh)
# or by hand: scripts/listener.sh [url]
# --from-queue is how the launchd agent com.ghostlight.listener calls it: it
# takes the request files Crew dropped in ~/.ghostlight-listener/queue and
# writes the result to ~/.ghostlight-listener/done-<request id>.
# sr-check.sh reverts the VM to its snapshot before and after every run and
# never touches other VMs, shared folders or security settings.
set -u -o pipefail

CREW="$(cd "$(dirname "$0")/.." && pwd)"
Q="$HOME/.ghostlight-listener"
REQS=""
if [ "${1:-}" = "--from-queue" ]; then
  shift
  REQS="$(ls "$Q/queue" 2>/dev/null)"
  for r in $REQS; do rm -f "$Q/queue/$r"; done
  [ -z "$REQS" ] && exit 0
fi
GL="${GHOSTLIGHT_DIR:-$(cd "$CREW/../ghostlight" && pwd)}"
URL="${1:-https://ghostlight.kashifnazir.com/}"
STAMP="$(date +%Y-%m-%d-%H%M)"
REL="reports/listener-$STAMP.md"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

for sc in tavern drunk; do
  echo "listener: $sc"
  touch "$TMP/start-$sc"; sleep 1
  "$GL/scripts/sr-check.sh" "$URL" "$sc" > "$TMP/$sc.log" 2>&1
  echo $? > "$TMP/$sc.rc"
  tail -2 "$TMP/$sc.log"
  # sr-check writes tests/sr/reports/<date>/report.json, overwritten per run;
  # only take it if this run wrote it, so a stopped run can't reuse an old pass.
  R="$GL/tests/sr/reports/$(date +%Y-%m-%d)/report.json"
  if [ -f "$R" ] && [ "$R" -nt "$TMP/start-$sc" ]; then cp "$R" "$TMP/$sc.json"; fi
done

python3 "$CREW/scripts/listener_report.py" "$TMP" "$URL" "$CREW/$REL" > "$TMP/summary"
rc=$?
cat "$TMP/summary"
for r in $REQS; do cp "$TMP/summary" "$Q/done-$r"; done
git -C "$CREW" add "$REL" && git -C "$CREW" commit -q -m "listener: NVDA check of the live site $STAMP" -- "$REL" \
  && echo "listener: committed $REL"
exit $rc
