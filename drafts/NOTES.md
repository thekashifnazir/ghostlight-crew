# Notes: chapter 5 and 6 room drafts, chapter 4 and 5 items (12 Nov)

Drafted by hand by Claude Code, not by the Crew job and with no Kiro credits, from the 10 Nov coverage reports (reports/ch5-coverage-2026-11-10.md, reports/ch6-coverage-2026-11-10.md), hotspot rectangles from the native engine's state on 12 Nov, and one screenshot per room where the room could be reached. Screenshots are kept out of git because they show game art. Every entry is a draft for Kash to approve. Chapter 4 rooms are left to the nightly Crew job.

Key: **C** confirmed (look line in the report, engine state, or visible in the screenshot); **I** inferred.

## Chapter 5
- **45 Castle towers.** C: night, full moon, towers, spiral stairs and rope bridges (screenshot); tower rects and destinations (state); 103 hidden at the start (state). I: calling it the chapter's hub ("tower map" in the report).
- **49 Werewolf's study.** C: werewolf at a desk with a typewriter, bookshelf on the left, dark arched window with a framed picture and a poster to its right on the back wall, red rug, dark doorways on both sides (screenshot); look lines for 51, 200, 201, 203 (report). I: which doorway is 109 and which 110; diploma (202) taken to be the framed picture on the back wall.
- **50 Inside the small tower.** C: two dark doorways, floor opening, small window (screenshot); 106 on the left (state). I: 107 as the right doorway, 112 as the floor opening.
- **51 Inside the tower on the right.** C: doorway on the left (108 rect), floor opening (113 rect), cracked right wall (screenshot and state).
- **52 Inside the tower right of centre.** C: doorway on the right (111 rect), floor opening (screenshot). I: 114 as the floor opening.
- **53 Laboratory.** C: all rects (state); machines on the left, creature in a metal chair on the right, archway at the back (screenshot); look lines (report). I: "hanging from the ceiling" for the contraption with the drill.
- **54 Dungeon.** C: all rects (state); cell door with a barred window, skeleton, skull on the floor, cobwebs, steps on the left (screenshot); look lines (report).
- **55 Corridor with the sign.** C: sign AQUI NO DUERME DRASCULA with two yellow arrows, barred gate, camera, machine with an orange light, steps on the left (screenshot); look lines and the gate behaviour (report). I: no rects were dumped, so positions come from the picture; screws (122) position unknown, so none given.
- **57 Behind the barred gate.** C: same picture as 55 with the hero inside the gate; door 104 rect (state). I: describing it as the same corridor from behind the gate.
- **56 Drascula's bedroom.** C: all rects (state); door on the left, grandfather clock, coffin on a purple-draped table, bedside table with bottles (screenshot); look lines (report).

## Chapter 6
- **102 Pendulum room.** C: slab, pendulum blade, barrels, all rects (state and screenshot); look lines (report). I: 101 as your hand and 50 as yourself.
- **58 Cell with the torch.** Report only (seen false). Not reached on 12 Nov: walk and open on the wardrobe in room 59 stayed in room 59.
- **59 B.J.'s bedroom.** C: all rects (state); door with a wall lamp, B.J. on the bed, oval mirror, wardrobe, window, trunk (screenshot).
- **60 Bar.** C: all rects (state); exit sign and stairs on the left, crowd, Drascula in a cape, piano with a skull, barrels, burger poster (screenshot); look lines (report). I: which door is behind the red curtain; the bartender being the figure at the back in the middle (from his rect).
- **61 Back room.** Reached 14 Nov: from the chapter 6 bar save, `walk 110`. C: objects, rects and look lines (engine state on entry). I: "pinned up" for the papers. No screenshot.
- **58 Cell with the torch.** Reached 14 Nov: from the chapter 6 start save, `take 101`, `use 20 100` (after the pendulum). C: torch and door rects, the torch opening door 104 to room 59 (flag 8). The first visit at the chapter start is a cutscene. No screenshot.
- Why the 12 Nov tries missed: the 59 wardrobe can never be a door (objects.cpp forces it off in room 59), and 59 has no way back to 58.

## Items (drafts/items/items-ch4-ch5.json)
- C: inventory read through the engine's own inventory command at the chapter 4 start (slot 40) and chapter 5 start (slot 48). Item 20 in chapters 4 and 5 has the same look line meaning as chapters 2 and 3 ("immune against vampire bites"), so it keeps the name "Von Braun's brew". Item 9 has no look line. Item 28's look line matches the existing entry.

## Process
- Screenshots: native engine in a real window with sound off, driven through the drascula-live MCP with a private save path (copies of .saves), window captured with screencapture. 14 of 16 rooms captured; 58 and 61 couldn't be reached.
- Validation: the drafts plus the items, merged into a scratch copy of packs/drascula-en.json, pass the pack validator (schema.json).
- Time: about 25 minutes on 12 Nov, from 01:45 to 02:10 UTC.
