# Hint walk: chapter 4

Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from the chapter 4 start save, against ghostlight e8247e7, using the pack's names.

| Milestone | Answer | Actions | Result | Evidence |
|---|---|---|---|---|
| ch4.start | Walk through the small tree | walk 100 | PASS | Chapter 4, room 21 at start. walk 100 moved to room 22 "Behind the tree". |
| ch4.magpie | Use the coin on the magpie | use 22 52 | PASS | flag 26 = 1. Said "SHE LOOKS DEAD, BUT SHE REALLY ISN'T, HUH?". |
| ch4.inside | Take the key, use it on the castle door, walk through | take 180; walk 102; use 7 101; walk 101 | PASS | key 7 added. flag 28 = 1. walk 101 reached room 23 "Entrance hall". |
| ch4.draskis | Close the far right door, go back outside, take the draskis | push 103; walk 103; walk 101; take 142 | FIX | No "close" action exists. push 103 said "IT'S ALRIGHT WHERE IT IS" and changed nothing. take 142 then gave draskis 8 and flag 11 = 1. |
| ch4.lab | Open far left door, take stairs up, right door to torch room, open and enter closet | open 104; walk 104; walk 108; walk 118; open 120; walk 120 | PASS | flag 25 = 1 after open 120 ("I FOUND A PINE STAKE"). walk 120 reached room 35 "Secret lab". |
| ch4.cloak | In the secret lab, take the cloak | take 148 | PASS | flag 14 = 1. cloak 16 added. |
| ch4.lubricant | Take the jars of brains, then the lubricant | take 147; take 149 | PASS | flag 15 = 1, flag 17 = 0. lubricant 13 added. |
| ch4.flour | Left-of-centre door to kitchen, right door to pantry, lubricant on closet, open closet | walk 121; walk 119; walk 112; open 114; walk 114; use 13 144; open 144 | PASS | flag 22 = 1. flour 12 added. Said "THAT TOOK AWAY THE RUST". |
| ch4.wig | From corridor, far left door to Igor's room, take the wig | walk 115; walk 113; walk 109; open 106; walk 106; take 143 | PASS | flag 12 = 1. wig 10 added. |
| ch4.disguise | Use the wig on yourself | use 10 50 | PASS | living-room keys 17 added. Draskis, cloak, flour and wig also removed. See Notes. |
| ch4.living-room | Keys on far left landing door, walk through | walk 108; use 17 116; walk 116 | PASS | flag 23 = 1. walk 116 reached room 31 "Living room". |
| ch4.axe | In the living room, take the axe | take 145 | PASS | flag 13 = 1. axe 11 added. |
| ch4.rope | In castle grounds, take the rope | walk 117; walk 109; walk 105; walk 103; take 141 | PASS | flag 10 = 1. rope 19 added. |
| ch4.branch | Behind the small tree, use the axe on the branch | walk 100; use 11 140 | PASS | flag 24 = 1. branch 18 added. |
| ch4.grapple | In inventory, use the rope on the branch | use 19 18 | PASS | rope tied to branch 21 added. Rope 19 and branch 18 removed. |
| ch4.tower | In castle grounds, use the rope tied to a branch on the tower | not run | NOT RUN | Action budget spent (45 of 45). Chapter change not checked. |

## Notes
- Actions used: 45 of 45. A walk 107 call from room 24 failed (not a hotspot there) and is not counted. State reads are not counted.
- ch4.draskis: the word "close" has no tool action. The door was never closed, and flag 11 still set. Whether walking out first was needed is untested. take 142 worked while draskis were hidden (visible false) in room 23.
- ch4.disguise: "use wig on yourself" also removed draskis 8, cloak 16, flour 12 and wig 10. The answer says draskis, flour or cloak also work, so the player may lose items here. Later milestones did not need them.
- ch4.lubricant: flag 17 went 1 after the jars, then 0 after the lubricant. The end state passes.
- No action timed out. No retries except the failed walk 107.

## Suggested fixes
- ch4.draskis: "In the entrance hall, go out through the door on the far right. Walk back in and take the draskis." Why: "close" has no game action. push 103 said "IT'S ALRIGHT WHERE IT IS". Re-entry is an untested assumption.

## Reviewer note (kiro-ideas, 17 Nov)
- ch4.draskis is a walker fault, not a hint fault: the drascula-live tools do have close (mcp/src/tools.ts TARGET_VERBS), and the whole-game route closes this door with `close 103` (data/playthrough-route.txt line 150). The walker missed the tool, then took the draskis while they were still hidden, which the raw tools allow and a Ghostlight player could not do. Answer unchanged.
- ch4.disguise losing the draskis, cloak, flour and wig is the game handing them over in the disguise scene; later milestones don't need them.
- ch4.tower was not walked (45-action budget spent); the whole-game route covers it nightly.
- Cost 3.4129 credits for 45 actions, about 12 times chapter 6 (11 actions, 0.27): each turn re-reads the growing context.
