# Drascula: Chapter 4 hotspot coverage

**Date:** 2026-11-10 (overnight run, 01:06 to 01:26 GMT for this chapter)
**Surveyed by:** overnight survey agent, driving the `drascula-live` MCP server (native transport) from a local script
**How reached:** **not by play.** Chapter 3 can't end through the engine (see the ch3 report), so I built a chapter-4 start save by hand (slot 40) and played the whole chapter from there. Details under "How slot 40 was made".
**Rooms visited:** 21 of 21 chapter-4 rooms in the game data (census: 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 34, 35, 36 to 44). The pack has **0** chapter-4 rooms.

## Real gaps (engine says nothing useful AND the pack has nothing)

82 hotspots looked at: 16 ok, **27 object/person gaps**, **39 exit gaps**.

Objects and people with only silence or stock filler ("It's not unusual", "There is nothing special about it", "I can't see anything in particular"):

- Room 21: rope 141, tower 179, front door 173 (a fake door, not an exit)
- Room 22: branch 140, key 180
- Room 23: draskis 142, speaker 170 (two hotspots share the number), table 171, picture 174
- Room 26: wig 143, **Igor 51** (also has a **blank name** until you've talked to him), drawers 167, portrait 169
- Room 27: door 166 (four fake doors share this number)
- Room 28: box 200 (silent; everything else in this dark room says "this room is too dark")
- Room 29: saucepan 154 (two hotspots share the number), bin 155, drawers 156
- Room 30: closet 144 (the puzzle closet), fridge 157, things 159
- Room 31: axe 145, T.V. 160, fireplace 162
- Room 35: brains 147, cloak 148, lubricant 149

Exits: every door, stair, passage and maze door in the chapter is silent or filler and has no pack label (39). The maze (rooms 36 to 43) is eight rooms of two silent doors each.

Room level: no chapter-4 room has a pack room description, so a player gets no room description on entry, and hotspot names fall back to the engine's names plus the pack's text fixes (ARBOLITO, PASADIZO, CHIMENEA, PUERTA, P, ESCALERAS and TAPESTRIE already have fixes in the pack; DRASKIS and SALIDA are covered or harmless).

## Where progress stopped, and why

All 21 rooms reached and the whole puzzle chain played (key from the magpie, castle doors, Igor, maze, closet, lubricant, draskis, wig disguise, living-room keys, axe, branch plus rope). Stopped at the **chapter end**: `use 21 179` (rope tied to the branch, on the tower) in room 21. The engine played the climb animation and faded to black, but the chapter didn't end (`state`: chapter 4, room 21, item 21 still held). It's the same dropped `checkAction()` return as chapter 3 (`room_21()` returns `true` after `animate("st.bin")`; the a11y layer ignores it). Slot 47 is the state just before it.

Other engine problems hit on the way:

1. **Hang in room 22.** `look 180` (the key) walks the hero to (207,160), which is outside the room's walk area (y 165 to 181). The next command that walks (`use 22 52`, coin on the magpie) never came back: `sample` showed the engine stuck in `walkToPoint()` (`objects.cpp:83`), and the busy watchdog's skip and "commands dropped" didn't free it. I had to stop the engine and reload slot 40. Second time I did `walk 52` before the `use` and it worked. Same risk after `take 180` and after chopping the branch (hero ends at y 160 to 163). Leaving by the exit worked both times.
2. **Long animations time out the MCP call** (`use 9 51` in ch3, `use 21 179`, `look 14`): "did not settle within 10s". The engine was fine afterwards.

## Not a hotspot gap, but a blind player will be misled: inventory names

In chapters 4 to 6 the engine's own item names cover only ids 7, 9, 19, 20, 22 and 28 (`a11y.cpp` `itemName()`), and the pack's items are all tagged chapters 1 to 3. Ghostlight names a carried item with `Pack.itemName(id, chapter)` (`src/model/pack.ts` around line 252), which **falls back to the first entry for that id whatever its chapter**. So in chapter 4 the player would hear the chapter-2 names:

| id | What it is in ch4 (engine look line) | Ghostlight would say |
|---|---|---|
| 7 | key ("A COMPLETELY NORMAL KEY") | money |
| 8 | draskis | leaves |
| 10 | wig | iron spike |
| 11 | axe | earplugs |
| 12 | bag of flour | music book |
| 13 | lubricant ("IT'S MARGARET'S THATCHERS DEODORANT...") | bubble gum |
| 14 | pine stake | sickle |
| 15 | brains | tissues |
| 16 | cloak | cigarettes |
| 17 | living-room keys | candle |
| 18 | branch | two coins |
| 19 | rope | one coin |
| 21 | rope tied to a branch | "item 21" |
| 22 | coin | B.J.'s handbag |

This comes from reading the code against the ids I held live. I didn't hear it through the player.

## How slot 40 was made (so nobody mistakes it for a played save)

I copied an engine-written save (slot 31) and replaced only the body with what `runCurrentChapter()` sets up for a fresh chapter 4 (`drascula.cpp` around line 506): chapter 4, room 21, hero at 235,164, inventory phone 28, cross 9, reefer 20, coin 22, all flags 0. The engine loads it through its own different-chapter path (`loadGame()` sets `_loadedDifferentChapter`, runs the chapter-4 setup, then loads the save). Script: `/private/tmp/claude-501/-Users-kash-Code-sandbox-hackathonideas/44732c53-a684-4b7a-813b-33c87efda638/scratchpad/walks/craft.py`. Everything after slot 40 is engine play.

## Save slots (all in `/Users/kash/Code/showcase/ghostlight-crew/.saves`)

| Slot | Chapter / room | What it holds |
|---|---|---|
| 40 | ch4, room 21 | **Hand-built** chapter-4 start (see above). |
| 42 | ch4, room 34 | Rooms 21 to 30 explored, key used, Igor met; before opening the closet. |
| 44 | ch4, room 23 | Draskis taken; flag 18 set (Igor's gone to supper). Ready for the wig. |
| 45 | ch4, room 24 | After the wig disguise; living-room keys (17) held. |
| 46 | ch4, room 22 | Axe used on the branch; branch (18) and rope (19) held. |
| 47 | ch4, room 21 | Rope tied to the branch (21); one step before the chapter end that doesn't fire. |

(Slots 41 and 43 were chapter-4 checkpoints early on; I reused them later for chapter 6.)

## Per-room detail

Filler lines are picked at random, so one object can show different fillers on different looks; any hotspot showing only filler has no authored line. Where several hotspots share one number (166, 170, 151, 154, 999), `look <num>` always hits the first one, so the rest can't be looked at separately through the MCP server.

### Room 21 (castle grounds: tree, tower, front door)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 100 | ARBOLITO | exit to 22 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 101 | DOOR | exit to 23 | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP (exit) |
| 141 | ROPE | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 179 | TOWER | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR / THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |
| 173 | DOOR | object | filler: IT'S NOT UNUSUAL / THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |

### Room 22 (behind the tree: magpie, key)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 102 | SALIDA | exit to 21 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 140 | BRANCH | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |
| 52 | MAGPIE | object | IT LOOKS LIKE THIS MAGPIE IS EVIL-MINDED | no (room not in pack) | ok |
| 180 | KEY | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |

### Room 23 (entrance hall: speakers, table)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 103 | DOOR | exit to 21 | filler: IT'S NOT UNUSUAL / THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP (exit) |
| 104 | DOOR | exit to 24 | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP (exit) |
| 142 | DRASKIS | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |
| 170 | SPEAKER (2 hotspots share this number) | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR / IT'S NOT UNUSUAL / THERE IS NOTHING SPECIAL… | no (room not in pack) | REAL GAP |
| 171 | TABLE | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR / IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 174 | PICTURE | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR / THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |

### Room 24 (tapestry corridor and stairs)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 105 | DOOR | exit to 23 | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP (exit) |
| 106 | DOOR | exit to 26 | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP (exit) |
| 108 | ESCALERAS | exit to 27 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 151 | TAPESTRIE (2 hotspots share this number) | object | SHE'S GOT NICE TRANSILVANIAN FEATURES | no (room not in pack) | ok |

### Room 26 (Igor's room)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 107 | DOOR | exit to 24 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 143 | WIG | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR / IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 51 | IGOR / igor | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |
| 163 | CALENDAR | object | IT'S ELVIS THE KING. YOU DIDN'T IMAGINE THAT WOULD BE HERE, DID YOU! | no (room not in pack) | ok |
| 164 | WINDOW | object | THE NIGHT IS FALLING OVER ALL OF US...THAT'S SCARY, ISN'T IT? | no (room not in pack) | ok |
| 165 | SHELF | object | A SHELF WITH BOOKS AND SOME OTHER THINGS | no (room not in pack) | ok |
| 167 | DRAWERS | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR / IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 168 | BOOK | object | "HOW TO FILL IN TAX RETURN FORMS". HOW INTERESTING! | no (room not in pack) | ok |
| 169 | PORTRAIT | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR / THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |

### Room 27 (upstairs landing: west wing, four fake doors)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 109 | ESCALERAS | exit to 24 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 110 | DOOR | exit to 28 | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP (exit) |
| 112 | DOOR | exit to 29 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 116 | DOOR | exit to 31 | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP (exit) |
| 118 | DOOR | exit to 34 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 150 | WEST-WING | object | TO THE WEST WING? NO WAY! NOBODY KNOWS WHAT YOU WILL FIND THERE!! | no (room not in pack) | ok |
| 175 | PICTURE | object | ...HE IS PALE, HE HAS FANGS AND WEARS A TOUPE�  HE SURE IS DRASCULA! | no (room not in pack) | ok |
| 166 | DOOR (4 hotspots share this number) | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR / IT'S NOT UNUSUAL / THERE IS NOTHING SPECIAL… | no (room not in pack) | REAL GAP |

### Room 28 (dark storeroom)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 111 | SALIDA | exit to 27 | MAN YOU SAY REALLY STUPID THINGS, THIS ROOM IS TOO DARK! | no (room not in pack) | ok (room-wide 'too dark' line) |
| 200 | BOX | object | (silent) | no (room not in pack) | REAL GAP |
| 999 | BARREL / BOX / DRAWER / TRUNK (8 hotspots share this number) | object | MAN YOU SAY REALLY STUPID THINGS, THIS ROOM IS TOO DARK! | no (room not in pack) | ok (room-wide 'too dark' line) |

### Room 29 (kitchen)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 113 | DOOR | exit to 27 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 114 | DOOR | exit to 30 | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP (exit) |
| 152 | OVEN | object | IT'S A SHAME THERE ISN'T A ROASTED LAMB IN THERE | no (room not in pack) | ok |
| 153 | SHIELD | object | THAT'S THE TRANSILVANIAN FOOTBALL TEAMS BADGE | no (room not in pack) | ok |
| 154 | SAUCEPAN (2 hotspots share this number) | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |
| 155 | BIN | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |
| 156 | DRAWERS | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |

### Room 30 (pantry: closet, fridge)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 115 | DOOR | exit to 29 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 144 | CLOSET | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |
| 157 | FRIDGE | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 158 | STILL-LIFE | object | IT LOOKS IMPRESSIONIST TO ME... | no (room not in pack) | ok |
| 159 | THINGS | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |

### Room 34 (torch room: closet, bookcase)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 119 | DOOR | exit to 27 | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP (exit) |
| 120 | CLOSET | exit to 35 | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP (exit) |
| 122 | SHELF | exit to 36 | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP (exit) |
| 146 | TORCH | object | IT SEEMS A LITTLE LOOSE ON THE WALL | no (room not in pack) | ok |

### Room 35 (secret room behind the closet)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 121 | PASADIZO | exit to 34 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 147 | BRAINS | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |
| 148 | CLOAK | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
| 149 | LUBRICANT | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |

### Room 36 (passage 1)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 123 | PUERTA | exit to 34 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 124 | PUERTA | exit to 37 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 37 (passage 2)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 125 | P | exit to 36 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 126 | P | exit to 38 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 38 (passage 3)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 127 | P | exit to 37 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 128 | P | exit to 39 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 39 (passage 4)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 129 | P | exit to 38 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 130 | P | exit to 40 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 40 (passage 5)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 131 | PUERTA | exit to 39 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 132 | PUERTA | exit to 41 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 41 (passage 6)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 133 | PUERTA | exit to 40 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 134 | PUERTA | exit to 42 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 42 (passage 7)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 135 | DOOR | exit to 41 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 136 | DOOR | exit to 43 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 43 (passage 8)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 137 | PUERTA | exit to 42 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 138 | PUERTA | exit to 44 | (silent) | no (room not in pack) | REAL GAP (exit) |

### Room 44 (passage end: poster)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 139 | DOOR | exit to 34 | (silent) | no (room not in pack) | REAL GAP (exit) |
| 172 | POSTER | object | "PASSAGE TO TOWERS CLOSED FOR REPAIRS. PLEASE USE THE MAIN ENTRANCE. SORRY FOR THE INCONV… | no (room not in pack) | ok |

### Room 31 (living room: axe, TV)

| # | Hotspot (engine name) | Kind | Engine line on look | Pack description | Verdict |
|---|---|---|---|---|---|
| 117 | DOOR | exit to 27 | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP (exit) |
| 145 | AXE | object | filler: I CAN'T SEE ANYTHING IN PARTICULAR | no (room not in pack) | REAL GAP |
| 160 | T.V. | object | filler: THERE IS NOTHING SPECIAL ABOUT IT | no (room not in pack) | REAL GAP |
| 161 | WINDOW | object | THE NIGHT IS FALLING OVER ALL OF US...THAT'S SCARY, ISN'T IT? | no (room not in pack) | ok |
| 162 | CHIMENEA | object | filler: IT'S NOT UNUSUAL | no (room not in pack) | REAL GAP |
