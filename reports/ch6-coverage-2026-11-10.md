# Drascula: Chapter 6 hotspot coverage

**Date:** 2026-11-10 (overnight run, 01:36 to 01:42 GMT for this chapter, plus the ending check after the 02:00 pause)
**Surveyed by:** overnight survey agent, driving the `drascula-live` MCP server (native transport) from a local script
**How reached:** **not by play.** Chapter 5 can't end through the engine (see the ch5 report), so I built a chapter-6 start save by hand (slot 49) and played from there.
**Rooms visited:** 5 of 5 chapter-6 rooms in the game data (census: 58, 59, 60, 61, 102). The pack has **0** chapter-6 rooms.

## Real gaps (engine says nothing useful AND the pack has nothing)

23 hotspots looked at: 10 ok, **8 object/person gaps**, **5 exit gaps**.

- Room 102 (pendulum): shackles 102 (engine name GRILLETES, which the pack's text fix turns into "shackles")
- Room 58: torch 103 (the puzzle object that opens the secret door)
- Room 59: mirror 107, trunk 106
- Room 60: **Drascula 56** and **the bartender 52**: the two characters in the final scene give only stock filler. Fans 115.
- Room 61: machine 118

Exits: room 59 door 108, room 60 doors 109 and 110, room 61 door 111 are silent, and room 59's closet 105 (the way back to 58) is filler. None has a pack label.

Room level: no pack room descriptions for any chapter-6 room.

## Where progress stopped, and why

All five rooms reached. After the 02:20 restart I played the ending chain from slot 43: `push 112` (piano) sets flag 7, the bartender's option 3 then changes to "EITHER YOU GET ME A SCOTCH... OR I'LL PLAY THE PIANO" and gives the drink (item 21), `use 21 56` gets Drascula drunk (flag 6), then `use 9 56` (the cross on Drascula) is the game's final action.

**The game's ending plays but the game never ends.** The MCP call timed out (10 s, no diff), the engine ran `animation_9_6()` (the ending scene and B.J.'s farewell note were heard: "BYE JOHNNY. PLEASE DON'T TRY TO FIND SOME KIND OF EXPLANATION..."), and afterwards the engine was still running and taking commands in **chapter 6, "room -2"**, with B.J.'s bedroom hotspots listed (look 107 answered "THERE IS NOTHING SPECIAL ABOUT IT"). In the original, `room_60()` returns `true` here, `runCurrentChapter()` returns and `run()` stops after chapter 6. The a11y layer drops that `true` (same cause as chapters 3, 4 and 5), so a player is left in a leftover room after the credits instead of the game finishing. Room -2 is the original game's own trick for blanking the room during the ending; it's not meant to be playable.

So all four chapter endings (3, 4, 5, 6) fail the same way, through the engine.

Other things a player would hit:

- Looking at (or talking to) B.J. in room 59 runs a long scripted scene, including a phone call (`room_59()`). It held the engine for about a minute, and the looks queued behind it timed out; I re-did them afterwards.
- The first look on the pendulum (room 102) runs the game's own `talk_pen()`, which flips flag 1 from 2 to 0. That's the original game's logic, not the survey.
- The engine names item 20, the thing you take from your own hand on the pendulum, "reefer", and its look line is "DAMN, I HAVE TO CUT MY NAILS!". Ghostlight's pack fallback would call it "Von Braun's brew".

## How slot 49 was made

Fresh chapter 6 runs `animation_1_6()` (Drascula's conversation) and ends with `enterRoom(102)` and `activatePendulum()`. Slot 49 is an engine save with the body set to that end state: chapter 6, room 102, inventory phone 28 and cross 9, flag 1 = 2 (on the pendulum) and flag 3 = 1 (set by `animation_5_6()`), everything else 0. The engine's own loader has a special case for exactly this (room 102 with flag 1 = 2 calls `activatePendulum()`). Script `craft.py` in `/private/tmp/claude-501/-Users-kash-Code-sandbox-hackathonideas/44732c53-a684-4b7a-813b-33c87efda638/scratchpad/walks/`. The opening conversation (`converse(11)`) was skipped by this, so it wasn't surveyed.

## Save slots (all in `/Users/kash/Code/showcase/ghostlight-crew/.saves`)

| Slot | Chapter / room | What it holds |
|---|---|---|
| 49 | ch6, room 102 | **Hand-built** chapter-6 start, on the pendulum. |
| 41 | ch6, room 59 | Out of the cell (torch moved), B.J.'s scene done (flag 11). |
| 43 | ch6, room 60 | Rooms 58 to 61 all visited; before the piano and bartender. |
| 32 | ch6, room 60 | Drink given to Drascula (flags 6, 7, 10); one step before the final `use 9 56`. |

## Per-room detail

Filler lines are random, so a hotspot can show different fillers on different looks.

### Room 102 (pendulum room)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 100 | PENDULUM | object | I DON'T LIKE PENDULAE. I'D PREFER ARTICHOKES | no (room not in pack) | ok |
| 101 | HACKER | object | DAMN, I HAVE TO CUT MY NAILS! | no (room not in pack) | ok |
| 50 | HACKER | object | HOW DO I LOCK MYSELF THEN? | no (room not in pack) | ok |
| 102 | GRILLETES | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |

### Room 58 (cell with the torch)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 103 | TORCH | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 104 | DOOR | exit to 59 | IT'S OBVIOUSLY A SECRET DOOR | no (room not in pack) | ok |

### Room 59 (B.J.'s bedroom)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 51 | B.J. | object | WHAT ARE YOU DOING HERE B.J.?. WHERE IS DRASCULA? / OH JOHNNY, HONEY, THANK GOD YOU'RE HE… | no (room not in pack) | ok |
| 107 | MIRROR | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 108 | DOOR | exit to 60 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 105 | CLOSET | exit to 58 | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP (exit) |
| 106 | TRUNK | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |

### Room 60 (bar with Drascula and the bartender)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 52 | BARTENDER | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 56 | DRASCULA | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |
| 109 | DOOR | exit to 59 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 110 | DOOR | exit to 61 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 112 | PIANO | object | THE PIANIST IS NOT HERE | no (room not in pack) | ok |
| 113 | SKULL | object | THAT'S A NICE SKULL WITH A VERY PENETRATING LOOK, HA, HA, HA, HA, THAT WAS GOOD! | no (room not in pack) | ok |
| 114 | POSTER | object | BEST BURGERS ON THIS SIDE OF THE DANUBE, ONLY 325! | no (room not in pack) | ok |
| 115 | FANS | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |

### Room 61 (back room)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 116 | PAPERS | object | IT'S A BET FOR TONIGHT'S GAME | no (room not in pack) | ok |
| 117 | CURTAIN | object | I WONDER WHAT IS BEHIND THAT | no (room not in pack) | ok |
| 118 | MACHINE | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 111 | DOOR | exit to 60 | (silent) | no (room not in pack) | REAL GAP (exit) |
