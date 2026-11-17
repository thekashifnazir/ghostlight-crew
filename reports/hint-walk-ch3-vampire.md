# Hint walk: chapter 3, reworded vampire answer
Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from the chapter 3 start save, against ghostlight 8d1d83e.

| Case | Milestone | Start room | "Still below the well"? | Actions | Result | Evidence |
|---|---|---|---|---|---|---|
| A | ch3.vampire | 20 | Yes. Room 20 is the room below the well, and flag 3 is 0. | 2 | PASS | Walk door 100 to room 13. Walk vampire 51: room 13, flag 3 = 1. |
| A | ch3.past-vampire | 13 | n/a (flag 3 = 1) | 1 | PASS | Use cross (9) on vampire 51: chapter 4, room 21, vampire gone. |
| B | ch3.vampire | 13 (after door 100) | No. Room 13 is past the far-right door. | 2 | PASS | Walk vampire 51: room 13, flag 3 = 1. |
| B | ch3.past-vampire | 13 | n/a (flag 3 = 1) | 1 | PASS | Use cross (9) on vampire 51: chapter 4, room 21, vampire gone. |

## Notes
- Actions used: 6 of 25.
- Case A: the tools do not report "below the well" directly. I judged it from the recap and the room-20 start.
- Case B: I judged the first clause false, because the door is already passed. The answer does not say what to do in that case. Walking toward the vampire worked anyway.
- `use 9 51` timed out in both cases with no engine reply. The state call afterwards showed chapter 4, so the use did run.
- After the chapter change, inventory dropped from 7 items to 4. Items 11 (earplugs), 14 (sickle) and 19 (one coin) are gone. I did not check which action removed them.
- One `state` call returned "a command is already in flight" and needed a retry.
- Session stopped after each case.

## Suggested fixes
None.
