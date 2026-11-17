#!/bin/sh
# hint-walk-changed.sh: the hint-walk gate. Re-walk only the Drascula chapters whose
# hints changed in Ghostlight's pack since a given commit, one Crew job at a time.
# Spends Kiro credits (about 0.25 to 1 a chapter on Haiku, 17 Nov), so run it on a
# human's go after a pack change; --dry-run only lists the chapters.
#
# Usage (on the Crew VM):  ~/ghostlight-crew/scripts/hint-walk-changed.sh <since-commit> [--dry-run]
#   e.g. after freeware-kiro deploys a hint change: hint-walk-changed.sh 8d1d83e
# Needs the chapter start saves drascula.092 to .096 in ~/ghostlight-crew/.saves-hintwalk/.
# Reports: reports/hint-walk-ch<N>.md, committed here and pushed by ghostlight-crew-push.
set -eu
SINCE=${1:?usage: hint-walk-changed.sh <since-commit> [--dry-run]}
DRY=${2:-}
G=$HOME/ghostlight; C=$HOME/ghostlight-crew; KC=$HOME/.local/bin/kirocrew
git -C "$G" pull -q --ff-only
REV=$(git -C "$G" rev-parse --short HEAD)
CHS=$(python3 - "$G" "$SINCE" <<'PY'
import json,subprocess,sys
g,since=sys.argv[1:3]
load=lambda rev: json.loads(subprocess.check_output(["git","-C",g,"show",f"{rev}:packs/drascula-en.json"]))
a,b=load(since),load("HEAD")
key=lambda m:json.dumps({k:m.get(k) for k in ("id","hints","when","after","end","rooms")},sort_keys=True)
per=lambda d:{c:sorted(key(m) for m in d["milestones"] if m.get("chapter")==c) for c in range(1,7)}
pa,pb=per(a),per(b)
print(",".join(str(c) for c in range(1,7) if pa[c]!=pb[c]))
PY
)
echo "ghostlight $SINCE..$REV: hint changes in chapters: ${CHS:-none}"
[ -z "$CHS" ] && exit 0
[ "$DRY" = "--dry-run" ] && exit 0
spec(){ case $1 in 1) echo 1:None:15;; 2) echo 2:92:55;; 3) echo 3:93:25;; 4) echo 4:94:45;; 5) echo 5:95:35;; 6) echo 6:96:20;; esac; }
for ch in $(echo "$CHS" | tr , ' '); do
  python3 "$C/scripts/hint-walk-prompt.py" "$G/packs/drascula-en.json" "$C/agents" "$REV" "$(spec "$ch")" >/dev/null
  id=$(cd "$C" && "$KC" cron add "hintwalk-ch$ch-$REV" "$(cat "agents/hint-walker-ch$ch-prompt.txt")" --at "in 1 minutes" \
        --agent hint-walker-agent --model claude-haiku-5.5 --project-path "$C" --approval-mode auto --timeout-secs 1500 \
        | grep -o 'job: [0-9a-f]*' | cut -d' ' -f2)
  echo "chapter $ch: Crew job $id"
  i=0; while [ $i -lt 60 ] && ! ls "$HOME/.kiro/crew/cron-history/$id"*.jsonl >/dev/null 2>&1; do sleep 30; i=$((i+1)); done
  st=$(grep -o '"status": "[a-z_]*"' "$HOME/.kiro/crew/cron-history/$id"*.jsonl 2>/dev/null | tail -1 || true)
  cr=$(grep -o '"credits": [0-9.]*' "$HOME/.kiro/crew/sessions/cron_$id.jsonl" 2>/dev/null | tail -1 || true)
  echo "chapter $ch: ${st:-no result after 30 min}; ${cr:-credits unknown}"
  git -C "$C" add "agents/hint-walker-ch$ch-prompt.txt" "reports/hint-walk-ch$ch.md" 2>/dev/null || true
  git -C "$C" commit -q -m "Hint walker gate: chapter $ch against ghostlight $REV (since $SINCE); ${cr:-credits unknown}" 2>/dev/null || true
done
systemctl --user start ghostlight-crew-push || true
