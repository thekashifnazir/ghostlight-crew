# Drascula: Chapter 3 hotspot coverage

**Date:** 2026-11-10 (overnight run, 01:00 to 01:06 GMT for this chapter)
**Surveyed by:** overnight survey agent, driving the `drascula-live` MCP server (native transport) from a local script
**How reached:** real play. Loaded slot 20 (chapter-boundary save), which the engine opens as chapter 3, room 20.
**Rooms visited:** 2 of 2 chapter-3 rooms in the game data (census: rooms 13, 20). The pack has **0** chapter-3 rooms (`packs/drascula-en.json` covers chapters 1 and 2 only).

## Real gaps (engine says nothing useful AND the pack has nothing)

The pack has no entry for any chapter-3 room, so every hotspot falls back to whatever the engine says.

- Objects and people: **none**. The only one, the vampire (51), has a real line.
- Exits: **2**. Room 20 door 100 and room 13 door 101 both say nothing on look and have no pack label.
- Room-level: neither room has a pack room description. A player entering room 20 or 13 hears no room description, and the hotspot names fall back to the engine's raw names ("DOOR", "VAMPIRE", which the engine renames "yoda" after the first look).

Note on chapter 3: the engine's stock filler lines ("It's not unusual" and the rest) only fire in chapters 2, 4, 5 and 6 (`rooms.cpp` `room_0`). In chapter 3 an unhandled look is plain silence.

## Where progress stopped, and why

**Chapter 3 can't be finished through the engine.** The chapter ends when you use the crucifix on the vampire (`use 9 51` in room 13). I ran it:

- The engine ran the ending animation (`animation_2_3`): flags 0 and 1 changed and the hero walked off to x=332.
- The chapter never ended. `state` still said chapter 3, room 13. The MCP call also timed out ("did not settle within 10s", no diff).

Cause (from the source, not changed): `room_13()` returns `true` after `animation_2_3()`, and in the original game `checkAction()` passes that `true` up through `verify2()` to end `runCurrentChapter()`. The Ghostlight a11y layer calls `checkAction()` and **drops the return value** (`vendor/scummvm/engines/drascula/a11y.cpp`, `useItemOnSlot` around line 1212, same pattern in `runVerbOnSlot` around line 1059). Only `walk` passes a chapter end up (`poll()`, `endedChapter`). Chapter 1 (door 105) and chapter 2 (well 173) end on a walk, so they work. Chapters 3, 4, 5 and 6 all end on a `use` or `open`, so none of them can end. I checked the code paths for all four (`room_13`, `room_21`, `room_56`, `room_60`), and the ch4, ch5 and ch6 reports confirm the same failure live.

Chapters 4 to 6 were surveyed from hand-built chapter-start saves (see those reports). Not by play.

Time spent: about 6 minutes. No puzzle was involved; it's an engine-layer blocker.

## Save slots (all in `/Users/kash/Code/showcase/ghostlight-crew/.saves`)

| Slot | Chapter / room | What it holds |
|---|---|---|
| 30 | ch3, room 20 | Chapter-3 start (same state as slot 20). Real play. |
| 31 | ch3, room 13 | Entered room 13, vampire looked at (flags 2, 3). Real play. |
| (32) | n/a | Held the post-`use 9 51` stuck state until 02:21, when I overwrote it by mistake with a chapter-6 checkpoint (see the ch6 report). To reproduce: load slot 31, `use 9 51`, then `state`. |

## Per-room detail

### Room 20 (start of chapter 3, under the well)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 100 | DOOR | exit to 13 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 99 | DOOR | exit to 20 | (silent) | no (room not in pack) | not exposed (hidden all chapter) |

### Room 13 (the vampire's passage)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 101 | DOOR | exit to 20 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 51 | VAMPIRE (engine renames it "yoda" after the first look) | person | IT'S A VAMPIRE THAT WON'T LET ME COME THROUGH / HE LOOKS LIKE YODA, BUT A LITTLE TALLER | no (room not in pack) | ok |

Also checked: talking to the vampire opens a 4-option conversation (choice 4 ends it). The carried items all have engine look lines, and the pack names all seven correctly for chapter 3 (phone, earplugs, sickle, handbag, crucifix, brew, one coin).

---

_Method: one engine instance, `look` on every hotspot the engine lists (visible or not), engine text taken from the diff's `said` lines and text events. Pack check against `packs/drascula-en.json`: a hotspot counts as a real gap only when the engine line is silence or stock filler and the pack has no description or exit label for it. Raw call log: `/private/tmp/claude-501/-Users-kash-Code-sandbox-hackathonideas/44732c53-a684-4b7a-813b-33c87efda638/scratchpad/walks/calls.jsonl`._
