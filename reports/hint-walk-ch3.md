# Hint walk: chapter 3

Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from the chapter 3 start save.

| Milestone | Answer | Actions | Result | Evidence |
| --- | --- | --- | --- | --- |
| ch3.start | Walk through the door on the far right. | 1 | PASS | `walk 100` moved the hero from room 20 to room 13. |
| ch3.vampire | From where you arrived, walk through the door on the far right. In the next room, walk towards the vampire. | 0 | FIX | Room 13 has one door (101), on the far left. No door on the far right. Flag 3 stayed 0. |
| ch3.past-vampire | Use the crucifix on the vampire. | 1 | PASS | `use 9 51` changed the chapter. State: chapter 4, room 21. The tool reported no engine reply within 10s, but the state showed the change. |

## Notes

- Game actions used: 2 of 25. Start, state and inventory calls were not counted.
- ch3.vampire was not run past its first clause, so flag 3 was never set.
- After the chapter change, the inventory fell from 7 items to 4. Lost: earplugs, sickle, one coin.

## Suggested fixes

- ch3.vampire: "In the next room, walk towards the vampire." Why: after ch3.start the hero is already in room 13, and no far-right door exists there. The vampire is hotspot 51 on screen. Untested.
