# Hint walk: chapter 5
Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from the chapter 5 start save, against ghostlight e8247e7, using the pack's names.

| Milestone | Answer | Actions | Result | Evidence |
|---|---|---|---|---|
| ch5.start | Go into each open tower in turn. Start with the tall tower left of centre. | none (on start) | PASS | Start state: chapter 5, room 45 "Castle towers", hero in control. |
| ch5.werewolf | From the castle towers, go into the tall tower left of centre. | walk 102 | PASS | Room 45 to room 49 "Werewolf's study". Flag 7 = 1. Said "AHHH A WEREWOLF!!". |
| ch5.bj | Go into the tower on the right, down through the opening in the floor, and talk to the cell door. | walk 109, walk 101, walk 113, talk 118, choose 4 | PASS | Walk 109 returned to room 45. Walk 101 to room 51, walk 113 to room 54 "Dungeon". Talk 118: "IT'S B.J.! ARE YOU ALL RIGHT B.J.?". Flag 0 = 1. |
| ch5.skeleton | In the dungeon, talk to the skeleton. | talk 53, choose 4 | PASS | Said "YUUU...SKELETONNNN..!!!". Flag 14 = 1 after the conversation closed. |
| ch5.bone | In the dungeon, take the bone. It lies at the foot of the skeleton, right of the cell door. | take 9999 | PASS | Said "TAKE IT, IT'S YOURS". Bone (id 8) added to inventory. Flag 13 = 1. |
| ch5.werewolf-gone | In the werewolf's study, use the bone on the werewolf. | walk 115, walk 108, walk 102, use 8 51 | PASS | Werewolf (51) disappeared from room 49. Bone (id 8) removed. Flag 6 = 1. |
| ch5.screws | Go into the tower right of centre, down through the opening in the floor, and take the screws in the corridor. | walk 110, walk 103, walk 114, take 122 | PASS | Screws (id 12) added to inventory. Flag 8 = 1. |
| ch5.power | In the laboratory, take the plug, then use the plug on the wall socket. | walk 117, walk 111, walk 100, walk 112, take 120, use 16 121 | PASS | Plug (id 16) added, then removed by use 16 121. Flag 2 = 1. |
| ch5.brains | In the laboratory, use the brains on the creature in the chair. | use 15 52 | PASS | Said "ALL RIGHT". Brains (id 15) removed. Flag 4 = 1. |
| ch5.fix-screws | In the laboratory, use the screws on the creature in the chair. | use 12 52 | PASS | Screws (id 12) removed. Flag 3 = 1. |
| ch5.switch | In the laboratory, push the on and off switch. | push 123 | PASS | Push timed out. Flag 1 = 1 on the next state. Hero then showed in room 57, not the laboratory. |
| ch5.coffin | Go through the door to Drascula's bedroom, then open the coffin. When Drascula catches you, choose WAIT A SECOND!, WHAT ABOUT MY LAST WISH? to go on. | walk 104, open 124, choose 4 | PASS | Open 124 said "IT'S EMPTY!", then "HA, HA, HA. YOU FELL FOR IT!!". Choice 4 was "WAIT A SECOND!, WHAT ABOUT MY LAST WISH?". Chapter changed from 5 to 6 at room 102. |

## Notes
- Game actions used: 29 of 35. Skip and state calls were not counted.
- Timeouts: walk 102 (Werewolf dialogue), push 123 and open 124 (Drascula speech). Each cleared with skip, then state or choices.
- Two conversations (B.J. and the skeleton) stayed open and blocked state. I closed each with choice 4, which the answers do not mention. The skeleton flag may come from the talk alone; this run cannot tell.
- Tower 103 ("right of centre") was hidden in room 45 until the hero walked back out of room 49. The answer does not say this, so a player could miss it.
- Push 123 moved the hero from the laboratory (53) to room 57 with no diff. Flag 1 still set. Cause unknown.
- The engine names object 52 "FRUSKYNSTEIN". The pack name "creature in the chair" matches it by id.
- Inventory at end: 28, 7, 9, 11, 13, 14, 17, 20.

## Suggested fixes
None.
