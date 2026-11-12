"""Crew script job: post a review card to Discord for each drafted chapter 4 room
that has no decision yet, so Kash can Approve, Change or Reject it with a short reply.

The script costs nothing itself. Each card is handed to the night-jobs thread's chat
session (ctx.notify session="origin"), whose agent posts it and, when Kash answers,
records the decision in drafts/ch4/decisions.json with its
file tools (the only extra file Crew may write, per ~/.kiro/settings/permissions.yaml).
Kash replies in the thread by typing Approve/Change/Reject room N (replies to a
cron-started turn reach Discord as text, so buttons show only as a list). A separate
zero-token job commits decisions.json; the push timer pushes it.

ctx.message "TEST" posts one clearly marked test card instead of real ones.
"""
import json
import os
import re

ROOT = "/home/kash/ghostlight-crew/drafts/ch4"
DRAFT = os.path.join(ROOT, "draft-4.json")
FLAGS = os.path.join(ROOT, "flags.md")
DECISIONS = os.path.join(ROOT, "decisions.json")
MAX_CARDS = 4

PROTOCOL = (
    "Review protocol for chapter 4 drafted rooms (Ghostlight). When Kash replies "
    "for room {room} (he types Approve room {room}, Change room {room} or Reject room {room}):\n"
    "- Approve or Reject: read {dec} (if it is missing, start from {{\"decisions\": []}}), "
    "append {{\"room\": {room}, \"decision\": \"approve\" or \"reject\", \"at\": <UTC ISO time>, "
    "\"note\": <anything Kash said, or \"\">}}, write the file back with your file tools, and reply "
    "with one short line confirming. Nothing else.\n"
    "- Change: ask Kash what to change. Then edit only room {room}'s entry in {draft} with your "
    "file tools, append {{\"room\": {room}, \"decision\": \"change\", \"at\": ..., \"note\": <what "
    "changed>}} to {dec}, and post the updated card again with the same reply line.\n"
    "Never write any other file, never use the shell, and never touch the ghostlight pack."
)


def _load(path, default):
    try:
        with open(path) as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return default


def _flags_for(room):
    try:
        text = open(FLAGS).read()
    except OSError:
        return []
    m = re.search(r"^### Room %d\b.*?$(.*?)(?=^### |^## |\Z)" % room, text, re.M | re.S)
    if not m:
        return []
    bullets = [b.strip()[2:] for b in m.group(1).splitlines() if b.strip().startswith("- ")]
    return [b if len(b) <= 160 else b[:157] + "..." for b in bullets[:3]]


def _names(entries, key):
    out = []
    for num, e in (entries or {}).items():
        label = (e.get(key) or "").strip()
        if label:
            to = e.get("to")
            out.append(f"{label} (to room {to})" if to is not None else label)
    return out


def _card(r):
    room = r["room"]
    lines = [f"**Chapter 4, room {room}: {r.get('name') or '(no name yet)'}**"]
    if r.get("short"):
        lines.append(r["short"])
    objs = _names(r.get("objects"), "name")
    exits = _names(r.get("exits"), "label")
    if objs:
        lines.append("Objects: " + ", ".join(objs[:8]))
    if exits:
        lines.append("Exits: " + ", ".join(exits[:6]))
    flags = _flags_for(room)
    if flags:
        lines.append("Flags:")
        lines += [f"- {f}" for f in flags]
    return "\n".join(lines)


# Replies to a cron-started turn reach Discord as plain text, so Crew's [OPTIONS:]
# buttons arrive as a numbered list there. The card asks for a typed reply instead.
def _reply_line(room):
    return (f"Reply here with: Approve room {room}, Change room {room} and what to change, "
            f"or Reject room {room}.")


def _ask(ctx, room, card):
    prompt = (
        "Morning review card. Post the card below as your whole reply, word for word, with no "
        "buttons or options tag.\n\n"
        + card + "\n" + _reply_line(room) + "\n\n"
        + PROTOCOL.format(room=room, dec=DECISIONS, draft=DRAFT)
    )
    ctx.notify(prompt, session="origin")


def run(ctx):
    if (ctx.message or "").strip().upper() == "TEST":
        card = (
            "**TEST card (not a real room).** This is what each morning's review looks like: "
            "one card per room Crew drafted overnight. Replying to this one records nothing."
        )
        prompt = (
            "Post the card below as your whole reply, word for word, with no buttons or options "
            "tag. It is a TEST: if Kash replies to it, say it was a test and record nothing, "
            "write no files.\n\n" + card + "\n" + _reply_line(0)
        )
        ctx.notify(prompt, session="origin")
        return "posted 1 TEST card"
    draft = _load(DRAFT, {"rooms": []})
    decided = {d.get("room") for d in _load(DECISIONS, {"decisions": []}).get("decisions", [])}
    todo = [r for r in draft.get("rooms", []) if (r.get("name") or "").strip() and r.get("room") not in decided]
    for r in todo[:MAX_CARDS]:
        _ask(ctx, r["room"], _card(r))
    left = max(0, len(todo) - MAX_CARDS)
    return f"posted {min(len(todo), MAX_CARDS)} review card(s)" + (f", {left} more tomorrow" if left else "")
