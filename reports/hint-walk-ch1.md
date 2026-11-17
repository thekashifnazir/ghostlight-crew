# Hint walk: chapter 1
Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from a fresh game, against ghostlight e8247e7, using the pack's names.

| Milestone | Answer | Actions | Result | Evidence |
|---|---|---|---|---|
| ch1.start "Arrived at the inn" | Talk to the bartender, the drunk and the pianist. | start (fresh game) | PASS | Start state: chapter 1, room 62 "Inn bar", hero at 65,145, control with the player. |
| ch1.room "Got a room" | Talk to the bartender. | talk 52 | PASS | Flag 0 went from 0 to 1. Bartender said "OK. ROOM 512. UPSTAIRS. THE KEY IS UNDER THE DOOR". |
| ch1.bed "Went up to bed" | Walk through the curtained doorway under the HABITACIONES sign. | walk 105 | PASS | Chapter went from 1 to 2, room 62 to room 14. Walk timed out, then a long cutscene played ("I PUT YOU IN MY BED"). State after skips: chapter 2, room 14. |

## Notes
- Game actions used: 2 (talk 52, walk 105). Limit was 15.
- Non-action calls: state (several), skip (several), stop.
- Timeouts: `walk 105` and every `state` call timed out while a cutscene ran. Calling `skip` moved the engine on. The walk completed after about four skips.
- Odd: after the walk, the hero woke in room 14 with the glasses story. Chapter 2 began through a sleep scene, not a normal walk into a bedroom. The chapter change still counts as the milestone.
- Name mismatch: no object named HABITACIONES exists in room 62. The only matching exit is 105, a DOOR. "HABITACIONES" is object 162 in room 14, which is chapter 2. The milestone matched on "curtained doorway" alone.
- No items lost. Inventory stayed at [28] (mobile phone).

## Suggested fixes
None. All three milestones passed.
Optional: change the ch1.bed answer to "Walk through the curtained doorway to the guest rooms." The HABITACIONES sign is not in room 62, so a player can't see it there.

## Reviewer note (kiro-ideas, 17 Nov)
- The HABITACIONES sign note: room 62's pack entry does mention HABITACIONES, so a Ghostlight player hears it there; the walker only saw raw engine names. No change suggested.
