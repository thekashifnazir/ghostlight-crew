# Hint walk: chapter 2, the last six hints
Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from a save just after the book (slot 97, made by replaying the whole-game route to line 60), against ghostlight eac4104, using the pack's names.

| Milestone | Answer | Actions | Result | Evidence |
|---|---|---|---|---|
| ch2.earplugs | Use the music book on the pianist. | walk 178, walk 176, walk 125, walk 145, walk 148, walk 156, use 12 on 54 | PASS | Hero in room 14 (inn bar). Pianist said "I GUESS YOU CAN KEEP MY EAR-PLUGS". Flag 39 went 0 to 1. Item 12 book removed, item 11 earplugs added. |
| ch2.test | In Von Braun's den, use the earplugs on yourself. Then talk to Von Braun and choose I AM READY TO FACE YOUR TEST. | walk 159, walk 151, walk 146, walk 126, walk 175, walk 177, use 11 on 50, talk 55, choose 2 | PASS | Use said "ALL RIGHT. I GOT THE EAR-PLUGS IN" (flag 29 went 0 to 1). Choice 2 said "I AM READY TO FACE YOUR TEST." Flag 22 went 0 to 1. Hero sent to room 17. |
| ch2.recipe | Walk back in through the front door, then talk to Von Braun and choose WHY WOULDN'T DRASCULA KILL YOU? | walk 177, talk 55, choose 2, choose 4 | PASS | Choice 2 said "I'VE FOUND THIS IMMUNIZING BREW". Flags 22 and 33 both 1 in state. Choose 4 only closed the open talk. |
| ch2.ingredients | Candle, cigarettes, bubble gum, tissues, leaves (see pack). | none | PASS (already met) | Flag 38 was 1 in the start state. Inventory already held all five: 17 candle, 16 cigarettes, 13 bubble gum, 15 tissues, 8 leaves. |
| ch2.brew | If you're outside the hut, walk back in through the front door. Talk to Von Braun and choose I HAVE ALL THE INGREDIENTS OF THAT BREW. | walk 177, talk 55, choose 3 | PASS | Choice 3 said "I HAVE ALL THE INGREDIENTS OF THAT BREW", then "OH, ALL RIGHT. I'M GOING TO MAKE MYSELF ...THE BREW". Item 20 added (engine name reefer). Items 16, 13, 8, 17, 15 removed. Flag 36 read as 1 in the final state. |
| ch2.well | In the churchyard behind the church, walk into the well. | walk 176, walk 127, walk 134, walk 136, walk 138, walk 164, walk 173 | PASS | Final state: chapter 3, room 20. Chapter changed. |

## Notes
- Actions used: 31 of 35. That is 30 game actions plus one skip call.
- Timeouts: choose 2 (ch2.recipe), choose 3 (ch2.brew) and walk 173 (ch2.well). Each call returned "did not settle" while Von Braun or the game still spoke. state refused until the speech ended. In ch2.recipe, state also refused until choose 4 closed the open conversation.
- ch2.earplugs names no route. A player starting in Von Braun's den has to reach the inn bar first. I used the exits in the pack list: 18 to 17 to 2 to 4 to 10 to 12 to 14. The answer text itself worked once the hero was in the bar.
- ch2.ingredients was already met at start, so its answer text was not tested.
- choose 2 in ch2.test returned item 11 earplugs and item 19 one coin, and removed item 23. Walking from room 17 to room 2 cleared flag 29. Walking from room 4 to room 2 set flags 5 and 11. None of these is explained by the hints.
- Pack name mismatch: the pack lists room 5 exit 136 as "boarded window". The engine's object 136 is a WINDOW into room 6, and it worked.
- Flags are read from the 0-based state array. Diffs confirmed this for flags 12, 22, 29 and 39.

## Suggested fixes
None.
