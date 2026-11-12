# Ghostlight Survey Crew

A Kiro Crew that plays an old point-and-click adventure through its game engine and reports anything a blind player could not get past. It is the companion to [Ghostlight](https://github.com/thekashifnazir/ghostlight), which makes *Drascula: The Vampire Strikes Back* (1996, freeware) playable with a screen reader in the browser.

> Work in progress for Kiroween 2026. Code and reports are AI-generated under my direction.

## Why it exists

Making an old game accessible needs a description pack: a name, a description and an exit label for everything in every room, plus hints that match how far the player has got. Ghostlight's pack covers 21 of the game's 57 rooms, every room in chapters 1 to 3. Writing the rest by hand is slow, and checking that every puzzle can actually be done without sight is slower. The crew does the mechanical part, so people can spend their time on what only they can judge.

## The crew

| Bot | Job | What it may do |
|---|---|---|
| **surveyor** | Plays the game through the `drascula-live` MCP server (the real engine), room by room, following the pack's milestones. Reports puzzle blockers, missing descriptions and engine or tooling bugs | The 16 drascula tools run without asking. Fetching web pages, searching the web, changing its own model or approval mode, asking for more abilities and changing schedules all need a human yes |
| **listener** (planned) | After each deploy, runs one fixed script in a Windows VM: Chrome plus NVDA, presses the keys a player would, and compares what NVDA actually said with what it should have said | Runs that one script only |
| **describer** (planned) | Drafts pack entries for rooms the surveyor flags, in the pack's style | Writes drafts to `reports/` only. A human approves every entry before it goes into the pack |

## What it has found so far

- `reports/room-62.md`, `reports/room-63.md`: first surveys of the inn. The second pass, judged by what the player says rather than raw engine text, came back clean.
- `reports/bug-open-held-item.md`: the MCP server refused to open a carried item (the handbag), which blocked the rest of chapter 2. Fixed in Ghostlight.
- Also found and fixed in Ghostlight: carried items not tracked between moves, `state` returning stale flags, and `skip` with nothing to skip waiting 60 seconds.

## How it is wired

- `agents/surveyor-agent.json`: the surveyor's narrow agent spec (tools, file paths, the one MCP server). Copied into `~/.kiro/agents/` by a human; the bot cannot change its own trust settings.
- The `drascula-live` MCP server comes from the Ghostlight repo (`mcp/`), run with the native ScummVM build and its own save folder (`.saves/`, not committed).

## Honest limits

- A Bot's spawned workers in Kiro Crew don't receive that Bot's own MCP servers, so surveyor plays from its own session. Reported as feedback to the Crew team.
- Automated checks find mechanical problems. They don't tell you whether a game is enjoyable without sight: that needs blind players. Two testers were sent the build on 11 November 2026, and longer sessions are planned for 22 to 27 November.

Paths in `reports/` are from the machine that ran each report (a Mac or the Linux VM), so they won't match yours.

## Licence

Apache 2.0. See `LICENSE` and `NOTICE`.
