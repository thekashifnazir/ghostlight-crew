"""Turn the NVDA sr-check reports into one short listener report (markdown).

Usage: python3 listener_report.py <tmpdir with tavern.json/drunk.json/*.rc> <url> <out.md>

Per scenario: pass/fail per step, what NVDA said that a step forbade or missed.
H step (tavern): every utterance is classed as
  - cut marker: only the silent cut-off characters (U+034F, which NVDA's log
    shows as "I?" once PowerShell decodes it), or
  - hint: real words,
and anything that is only a cut marker is flagged, because whether NVDA makes
a sound for it needs a human ear.
"""
import json
import os
import re
import sys
from datetime import datetime

CUT_ONLY = re.compile(r"^(?:I\?|͏|\s)+$")


def load(path):
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def main():
    tmp, url, out = sys.argv[1], sys.argv[2], sys.argv[3]
    lines = [f"# Listener: NVDA check of the live site, {datetime.now():%Y-%m-%d %H:%M}", ""]
    lines.append(f"- URL: {url}")
    overall = True
    body = []
    for sc in ("tavern", "drunk"):
        rep = load(os.path.join(tmp, f"{sc}.json"))
        rc = open(os.path.join(tmp, f"{sc}.rc")).read().strip() if os.path.exists(os.path.join(tmp, f"{sc}.rc")) else "?"
        if not rep:
            overall = False
            body += [f"## {sc}: NO REPORT (sr-check exit {rc})", "", "See the run log in the job output.", ""]
            continue
        steps = rep.get("steps", [])
        passed = sum(1 for s in steps if (s.get("verdict") or {}).get("pass"))
        ok = rep.get("result") == "pass" and rc == "0"
        overall &= ok
        body += [f"## {sc}: {'PASS' if ok else 'FAIL'} ({passed} of {len(steps)} steps)", ""]
        body += ["| # | Keys | Result | Notes |", "|---|---|---|---|"]
        for s in steps:
            v = s.get("verdict") or {}
            notes = []
            if v.get("missing"):
                notes.append("missing: " + ", ".join(v["missing"]))
            if v.get("forbidden"):
                notes.append("said forbidden: " + ", ".join(v["forbidden"]))
            if sc == "tavern" and s.get("keys") == "h":
                utt = v.get("utterances", s.get("utterances", []))
                cut = [u for u in utt if CUT_ONLY.match(u)]
                words = [u for u in utt if not CUT_ONLY.match(u)]
                if cut:
                    notes.append(f"FLAG: {len(cut)} cut-marker-only utterance(s) {cut!r}; needs a human listen")
                notes.append("hint spoken: " + (" / ".join(w.strip() for w in words) if words else "none (voiced hint, not read by default)"))
            body.append(f"| {s.get('index')} | {s.get('keys')} | {'pass' if v.get('pass') else 'FAIL'} | {'; '.join(notes).replace('|', '/')} |")
        body.append("")
    lines.insert(2, f"- **Overall: {'PASS' if overall else 'FAIL'}**")
    lines += [""] + body
    with open(out, "w") as f:
        f.write("\n".join(lines).rstrip() + "\n")
    print(f"Listener: {'PASS' if overall else 'FAIL'}  report {out}")
    sys.exit(0 if overall else 1)


if __name__ == "__main__":
    main()
