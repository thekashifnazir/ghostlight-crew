# Drascula: Chapter 5 hotspot coverage

**Date:** 2026-11-10 (overnight run, 01:26 to 01:36 GMT for this chapter)
**Surveyed by:** overnight survey agent, driving the `drascula-live` MCP server (native transport) from a local script
**How reached:** **not by play.** Chapter 4 can't end through the engine (see the ch4 report), so I built a chapter-5 start save by hand (slot 48), the same way as chapter 4's slot 40. I played from there to the plug puzzle in room 53, where the engine blocks progress. To get into the last two rooms I made a second hand edit (slot 37: the plug added to the inventory).
**Rooms visited:** 10 of 10 chapter-5 rooms in the game data (census: 45, 49 to 57). 8 reached by play from slot 48; rooms **56 and 57 only through the hand-edited slot 37**. The pack has **0** chapter-5 rooms.

## Real gaps (engine says nothing useful AND the pack has nothing)

39 hotspots looked at: 15 ok, **6 object gaps**, **18 exit gaps**.

- Room 54: bone 9999 (the item you need for the werewolf)
- Room 49: diploma 202
- Room 55: door 206. Not an exit: any verb on it plays the stake-detector animation and walks you back, **with no speech at all**. A blind player gets a sound effect and nothing else.
- Room 53: plug 120 and on/off switch 123 (both puzzle objects)
- Room 56: clock 207

Exits: all 18 exits (the four towers on the map in room 45, every tower door and stair door) are silent or filler with no pack label. The tower map is the chapter's hub, and its four towers only give stock filler.

Room level: no pack room descriptions for any chapter-5 room.

## Where progress stopped, and why

1. **Real blocker in room 53 (Frankenstein's lab), the plug.** `take 120` runs the game's own `pickObject(16)`, and in chapter 5 the game deliberately keeps the plug on the cursor rather than in the inventory (`interface.cpp` `selectVerb()` won't stow item 16 in chapter 5, the fix for ScummVM bug #3885). The a11y layer's item-return step then calls `selectVerb(kVerbNone)` to "drop the held item into the inventory" (`a11y.cpp` around line 1080). In chapter 5 that **throws the plug away**: the plug hotspot goes hidden, item 16 isn't in the inventory, and `use 16 121` (plug into wall socket) answers "item 16 is not in the inventory". Taking it again does the same. The switch then only says "THERE'S NO POWER". Chapter 5 can't be finished by play past this point. Slot 36 holds this state.
2. To survey rooms 57 and 56 I copied slot 36 and added item 16 to its inventory (slot 37). `use 16 121` then worked, `push 123` ran the machine scene and moved to room 57, and I walked into 56.
3. **Chapter end:** `open 124` (the coffin) in room 56 played the trap ("IT'S EMPTY!" ... "IGOR, TAKE HIM TO THE PENDULUM OF DEATH!") but the chapter didn't end (`state`: chapter 5, room 56). Same dropped `checkAction()` return as chapters 3 and 4 (`room_56()` returns `true`). Slot 39 is the state just before it.

Other things a player would hit:

- Walking into room 49 the first time starts the werewolf's long talk sequence. The `walk` call timed out after 10 s; one `skip` and a `state` read later it had settled.
- `look 118` (B.J.'s cell door, room 54) opens a conversation with B.J. through the door, so it's useful, but a survey or a player has to close it before doing anything else ("finish the conversation first"). Choice 3 there gives the hairpin (item 10).
- Inventory names: the chapter-4 naming problem applies here too. Ghostlight would call the key (7) "money", axe (11) "earplugs", lubricant (13) "bubble gum", stake (14) "sickle", brains (15) "tissues", keys (17) "candle", hairpin (10) "iron spike", bone (8) "leaves", screws (12) "music book", plug (16) "cigarettes". From code plus the ids held live; not heard through the player.

## How the hand-made slots were made

- **Slot 48** (chapter-5 start): body set to what `runCurrentChapter()` sets for a fresh chapter 5 (`drascula.cpp` around line 533): chapter 5, room 45, hero placed by the engine at the entry door, inventory 28, 7, 9, 11, 13, 14, 15, 17, 20, all flags 0. Script `craft.py`.
- **Slot 37**: slot 36 (engine-written) with item 16 put into the first free inventory slot, nothing else changed. Script `additem.py`.

Both scripts are in `/private/tmp/claude-501/-Users-kash-Code-sandbox-hackathonideas/44732c53-a684-4b7a-813b-33c87efda638/scratchpad/walks/`.

## Save slots (all in `/Users/kash/Code/showcase/ghostlight-crew/.saves`)

| Slot | Chapter / room | What it holds |
|---|---|---|
| 48 | ch5, room 45 | **Hand-built** chapter-5 start. |
| 33 | ch5, room 54 | Hairpin from B.J. and the bone taken. |
| 34 | ch5, room 45 | Werewolf fed the bone; tower 4 open. |
| 35 | ch5, room 53 | Screws held; before repairing Frankenstein. |
| 36 | ch5, room 53 | Frankenstein repaired (flags 3, 4); plug taken and **lost** by the a11y layer. Repro of the plug blocker. |
| 37 | ch5, room 53 | **Hand-edited**: slot 36 plus the plug in the inventory. |
| 38 | ch5, room 57 | After the machine scene (via slot 37). |
| 39 | ch5, room 56 | Before opening the coffin (the chapter end that doesn't fire). |

## Per-room detail

Filler lines are random, so a hotspot can show different fillers on different looks.

### Room 45 (tower map)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 100 | TOWER-1 | exit to 50 | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP (exit) |
| 101 | TOWER-2 | exit to 51 | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP (exit) |
| 102 | TOWER-3 | exit to 49 | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP (exit) |
| 103 | TOWER-4 | exit to 52 | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP (exit) |

### Room 51 (tower 2 stairs)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 108 | PUERTA | exit to 45 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 113 | PUERTA | exit to 54 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 54 (dungeon: skeleton, B.J.'s cell door)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 115 | DOOR | exit to 51 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 118 | DOOR (2 hotspots share this number) | object | IT'S B.J.! ARE YOU ALL RIGHT B.J.? / (B.J. conversation through the door) [opened convers… | no (room not in pack) | ok |
| 119 | LOCK | object | "SAFE AWAY LOCKS LTD." | no (room not in pack) | ok |
| 9999 | BONE | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |
| 53 | SKELETON | object | IT IS THE TYPICAL SKELETON YOU FIND IN THE DUNGEONS OF ALL THE GAMES | no (room not in pack) | ok |

### Room 49 (werewolf's study)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 109 | DOOR | exit to 45 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 110 | DOOR | exit to 45 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 51 | WEREWOLF | object | HE SEEMS QUITE RATIONAL | no (room not in pack) | ok |
| 200 | POSTER | object | IT IS A PICTURE OF PLATO WRITING HIS LOST DIALOGUE | no (room not in pack) | ok |
| 201 | DESK | object | THAT'S A VERY CUTE DESK | no (room not in pack) | ok |
| 202 | DIPLOMA | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 203 | WINDOW | object | IT'S A DARK NIGHT WITH A FULL MOON | no (room not in pack) | ok |

### Room 52 (tower 4 stairs)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 111 | PUERTA | exit to 45 | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP (exit) |
| 114 | PUERTA | exit to 55 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 55 (camera room: screws, detector)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 117 | DOOR | exit to 52 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 122 | SCREWS | object | IT SEEMS LIKE THESE SCREWS ARE NOT TIGHTENED PROPERLY | no (room not in pack) | ok |
| 204 | CAMERA | object | DON'T LOOK NOW, BUT I THINK THAT A HIDDEN CAMERA IS FOCUSING ON ME | no (room not in pack) | ok |
| 205 | DETECTOR | object | THAT'S A VERY MODERN STAKE DETECTOR | no (room not in pack) | ok |
| 206 | DOOR | object | (silent) | no (room not in pack) | REAL GAP |

### Room 50 (tower 1 stairs)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 106 | DOOR | exit to 45 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 107 | DOOR | exit to 45 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 112 | DOOR | exit to 53 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 53 (Frankenstein lab)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 116 | PUERTA | exit to 50 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 52 | FRUSKYNSTEIN | object | LOOK! THERE'S MIGUEL BOSE! | no (room not in pack) | ok |
| 121 | WALL-PLUG | object | IT IS COMMONLY USED TO TRANSFER ELECTRICITY TO THE MACHINES CONNECTED TO IT | no (room not in pack) | ok |
| 120 | PLUG | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 123 | ON/OFF | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |
| 209 | INDIFIBULATOR | object | IT IS HAND MADE BECAUSE THE JAPANESE MAKE THEM POCKET SIZE | no (room not in pack) | ok |

### Room 57 (landing outside the bedroom)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 104 | DOOR | exit to 56 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 56 (Drascula's bedroom: coffin)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 105 | DOOR | exit to 57 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 124 | COFFIN | object | A PINE WOOD COFFIN | no (room not in pack) | ok |
| 207 | CLOCK | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |
| 208 | TABLE | object | A NICE BEDSIDE TABLE | no (room not in pack) | ok |
