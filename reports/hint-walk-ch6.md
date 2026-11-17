# Hint walk: chapter 6
Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from the chapter 6 start save, against ghostlight e8247e7, using the pack's names.
| Milestone | Answer | Actions | Result | Evidence |
|---|---|---|---|---|
| ch6.start | Strapped under the pendulum (start state) | none | PASS | Start: chapter 6, room 102, hero in control |
| ch6.hand | "On the slab, take your hand." | take 101 | FIX | Item 20 added. "slab" matches no pack name. |
| ch6.free | "Use the thing from your hand on the pendulum." | use 20 100 | PASS | Item 20 removed. Room 102 to 58. Flag 2 set 0 to 1. |
| ch6.torch | "Push the torch. Then walk through the secret door on the far left." | push 103; walk 104 | PASS | Flag 8 set 0 to 1. Walk 104 moved hero to room 59. |
| ch6.bj | "In B.J.'s bedroom, talk to B.J. Then listen to the phone call." | talk 51 | FIX | Flag 11 set 0 to 1. B.J. said "I'M SORRY, BUT I HAVE TO HANG UP". "listen to the phone call" matches no pack name. |
| ch6.piano | "In the bar, push the piano." | walk 108; push 112 | PASS | Flag 7 set 0 to 1. Said "SHUT UP! WE'RE WATCHING THE GAME!" |
| ch6.scotch | "Talk to the bartender and choose EITHER YOU GET ME A SCOTCH ON THE ROCKS OR I'LL PLAY THE PIANO UNTIL THE GAME IS OVER." | talk 52; choose 3 | PASS | Flag 10 set 0 to 1. Item 21 added. Bartender said "OH, COME ON! TAKE IT!" |
| ch6.drink | "In the bar, use the scotch on the rocks on Drascula." | use 21 56 | PASS | Flag 6 set 0 to 1. Item 21 removed. |
| ch6.end | "In the bar, use the crucifix on Drascula." | use 9 56 | PASS | Game-end event fired. Credits played ("GOOOOOOOAAAAAAAL!"). Flag 5 not readable after the end. |

## Notes
- Game actions used: 11 of 20 (take 101, use 20 100, push 103, walk 104, talk 51, walk 108, push 112, talk 52, choose 3, use 21 56, use 9 56). Also one skip and several state checks, which are not game actions.
- talk 51 timed out at 10 s while B.J.'s phone speech kept playing. state timed out too. skip cleared the speech, and state worked after that.
- Item 20 is "reefer" in the engine. The pack calls it "thing from your hand".
- Flags were read as 0-based (flag 2 is array index 2).
- The free step also changed array index 1 from 2 to 0. The cause is not known.
- state refused after the game ended, so flag 5 could not be confirmed. The game-end event is the evidence.

## Suggested fixes
- ch6.hand: "Take your hand." Drop "On the slab," because no name matches it.
- ch6.bj: "In B.J.'s bedroom, talk to B.J." Drop "Then listen to the phone call." The call plays by itself during the talk, so the player takes no separate action.
