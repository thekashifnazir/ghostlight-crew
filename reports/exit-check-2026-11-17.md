
## Reviewer note (kiro-ideas, 17 Nov)
- **No exit leads somewhere other than its label.** The 1 WRONG is a script fault: room 19's well (173) has no "to" in the pack because it's the chapter 2 to 3 crossing; it landed in room 20, the chapter 3 start, as the pack note says. Fixed in exit-check.mjs: such exits now read CHAPTER EXIT.
- Of the 13 STAYED, 4 have an opensWhen in the pack (window 136, church door 138, front door 177, curtained doorway 105), so they're LOCKED as the pack says. The other 9 stay shut at that point in the route with no opensWhen: doors 101, 104, 106, 110, 114 (need opening first), tower 103 and hidden spot 99 (hidden then), doorway 110 in room 49 and the secret door 104 in room 58 (label already says it opens after the torch). Nothing in the player reads opensWhen yet (only specs and FORMAT.md), so this affects nothing spoken.
- The 4 NOT VISITED (room 1 exits 121 and 122, room 61 exit 111, room 63 exit 107) are rooms the route never stands in with control.
