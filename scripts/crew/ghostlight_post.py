"""Crew script job: run a Ghostlight night script, then post its last 20 lines to Discord.

Crew command jobs (--command) only report to the dashboard, so the night jobs run
through this script instead, which posts with ctx.notify. ctx.message holds the
script path to run (e.g. /home/kash/bin/ghostlight-nightly.sh). Install it under
~/.kiro/crew/crons/ (vm-setup.sh does this).
"""
import subprocess

# The night-jobs thread under #ghostlight-crew (Kash-test). Must be in discord.allowed_thread_ids.
THREAD = "thread:1570213514054738032"


def run(ctx):
    script = (ctx.message or "").strip()
    if not script:
        raise RuntimeError("no script path in the job message")
    proc = subprocess.run([script], capture_output=True, text=True, timeout=3200)  # under the longest job timeout (whole-game: 3300 s); the job timeout still caps shorter jobs
    out = (proc.stdout or "").strip()
    tail = "\n".join(out.splitlines()[-20:]) or "(no output)"
    head = "Ghostlight night job" + ("" if proc.returncode == 0 else f" exited {proc.returncode}")
    ctx.notify(f"{head}\n```\n{tail}\n```", channel_type="discord", target_id=THREAD)
    return tail
