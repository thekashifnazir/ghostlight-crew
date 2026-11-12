#!/bin/sh
# After the morning review: commit only drafts/ch4 decisions and edits, locally. No push.
cd "$HOME/ghostlight-crew" || exit 1
git add -- drafts/ch4/decisions.json drafts/ch4/draft-4.json
if git diff --cached --quiet; then echo "no review decisions this morning"; exit 0; fi
summary=$(python3 -c 'import json,subprocess;old=subprocess.run(["git","show","HEAD:drafts/ch4/decisions.json"],capture_output=True,text=True).stdout;o={(d["room"],d["at"]) for d in (json.loads(old)["decisions"] if old else [])};n=json.load(open("drafts/ch4/decisions.json"))["decisions"];print(", ".join("room %s %s" % (d["room"], d["decision"]) for d in n if (d["room"],d["at"]) not in o) or "draft edits")')
git commit -q -m "crew: ch4 review via Discord: $summary" -- drafts/ch4/decisions.json drafts/ch4/draft-4.json && git log --oneline -1
