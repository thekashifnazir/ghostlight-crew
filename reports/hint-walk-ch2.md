# Hint walk: chapter 2

Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from the chapter 2 start save, against ghostlight e8247e7, using the pack's names.

| Milestone | Answer | Actions | Result | Evidence |
|---|---|---|---|---|
| 1 ch2.start | Go up through the curtained doorway to the guest bedroom. | none (on start) | PASS | Start returned chapter 2, room 14, with control. |
| 2 ch2.handbag | In the guest bedroom, open the trunk under the window. | walk 162; open 183 | PASS | "I'VE FOUND B.J.'S HANDBAG!"; flag 20 = 1; handbag (22) added. |
| 3 ch2.money | Open the handbag in your inventory. | open 22 | PASS | "A ONE THOUSAND BILL AND A COUPLE OF COINS"; flag 23 = 1; money (7), two coins (18) added. |
| 4 ch2.cigarettes | In the back room, use the two coins on the machine, then push the machine. | walk 163; walk 171; use 18 on 188; push 188 | PASS | Use: "THIS IS A TRICK! NOTHING CAME OUT!". Push: "AT LAST!"; cigarettes (16) added; flag 26 = 1. |
| 5 ch2.von-braun-named | Talk to the drunk, then choose AND WHERE CAN I FIND VON BRAUN? | walk 172; talk 53; choose 3 | PASS | "HE LIVES IN A LOG-CABIN OUT OF TOWN"; flag 40 = 1. |
| 6 ch2.blind-man | From the square, go into the dead-end alley and talk to the blind man. | walk 159; walk 151; walk 149; talk 51 | PASS | Room 9; flag 4 = 1 (state). |
| 7 ch2.sickle | Use the money on the blind man. | use 7 on 51 | PASS | "HERE'S THE SICKLE IN EXCHANGE"; sickle (14) added; money gone. |
| 8 ch2.spike | In the cemetery, take the fence spike. | walk 152; walk 146; walk 126; walk 127; take 165 | PASS | Iron spike (10) added; flag 3 = 1. |
| 9 ch2.church | From the cemetery take the way round behind the fence, then use the iron spike on the boarded window. | walk 134; use 10 on 136 | PASS | "HA, HA, HA"; flag 8 = 1; spike used. |
| 10 ch2.crucifix | In the vestry, open the drawer, then take the crucifix. | walk 136; open 139; take 140 | PASS | Cross (9) added; flag 10 = 1. |
| 11 ch2.candle | In the vestry, open the arched door and go through. In the nave, take the candle. | open 138; walk 138; take 190 | PASS | Candle (17) added; flag 35 = 1. |
| 12 ch2.leaves | In the cemetery, use the sickle on the creeper. | walk 142; walk 137; walk 135; use 14 on 166 | PASS | Leaves (8) added; flag 37 = 1. |
| 13 ch2.bubble-gum | At the edge of the village, push the barrel. | walk 128; walk 125; push 189 | PASS | "LOOK, THERE'S A PIECE OF BUBBLE GUM STUCK HERE"; bubble gum (13); flag 34 = 1. |
| 14 ch2.tissues | In the lane between the inn and the square, look at the bin. | walk 145; walk 148; walk 158; look 147 | PASS | "A PACKET OF KLEENEX"; tissues (15) added; flag 7 = 1. |
| 15 ch2.into-hut | At the hut, open the door to knock, then talk to the door and choose DON'T BE AFRAID... | walk 161; walk 146; walk 126; walk 175; open 177; talk 177; choose 2 | PASS | Choice shown as "DON'T DE AFRAID, WE WILL BEAT DRASCULA TOGETHER."; flag 14 = 1. |
| 16 ch2.book | In Von Braun's den, take the book. | walk 177; take 182 | PASS | Book (12) added; flag 28 = 1. |
| 17 ch2.earplugs | Use the music book on the pianist. | none | NOT RUN | Action budget spent. |
| 18 ch2.test | In Von Braun's den, use the earplugs on yourself. Then talk to Von Braun and choose I AM READY TO FACE YOUR TEST. | none | NOT RUN | Needs earplugs from milestone 17. |
| 19 ch2.recipe | Walk back in through the front door, then talk to Von Braun and choose WHY WOULDN'T DRASCULA KILL YOU? | none | NOT RUN | Depends on milestone 18. |
| 20 ch2.ingredients | Candle, cigarettes, bubble gum, tissues, leaves. | none | PASS | Flag 38 = 1; inventory holds candle 17, cigarettes 16, bubble gum 13, tissues 15, leaves 8. |
| 21 ch2.brew | Talk to Von Braun and choose I HAVE ALL THE INGREDIENTS OF THAT BREW. | talk 55; choose 4 | FIX | Option not offered. Von Braun offered only: I HAVE COME TO GET INTO THAT CABIN AGAIN / I AM READY TO FACE YOUR TEST / ALL RIGHT OLD MAN. I CAME FOR MY MONEY / NO, NOTHING. I WAS JUST LEAVING. |
| 22 ch2.well | In the churchyard behind the church, walk into the well. | none | NOT RUN | Depends on milestones 17 to 21. |

## Notes

- Actions used: 52 of 55. Failed and timed-out calls count.
- Timeouts: talk 51, use 7 on 51, and use 14 on 166 timed out. State showed each result had happened.
- walk 159 was refused while the drunk's conversation was open. Choosing option 4 closed it.
- Milestone 2 assumes the hero starts in the bedroom. The hero started in the bar, so I walked the milestone 1 doorway first.
- Milestone 4: the first use turned two coins into one coin. The push then gave cigarettes.
- Milestone 17 needs about 7 more actions from the den (pianist is in the inn, five rooms away). The budget ran out first.

## Suggested fixes

- ch2.brew: Von Braun's brew option did not appear at this point. It may appear only after his test (milestone 18), which I could not reach. Suggest: "After passing Von Braun's test, talk to him and choose I HAVE ALL THE INGREDIENTS OF THAT BREW." Unverified.
- ch2.into-hut: the engine shows "DON'T DE AFRAID", the hint says "DON'T BE AFRAID". Match the on-screen wording, or flag the engine typo.

## Reviewer note (kiro-ideas, 17 Nov)
- ch2.brew is a walker fault, not a hint fault: in the pack it comes after ch2.ingredients, which comes after ch2.recipe and ch2.test. The walker ran out of budget before ch2.earplugs and tried the brew out of order, so Von Braun hadn't offered that line yet. The whole-game route reaches it (`choose 3` at line 84, after the test and recipe).
- "DON'T DE AFRAID" is the engine's typo; the pack's textFixes already correct it, so a Ghostlight player never sees it. The walker reads the raw engine text.
- ch2.earplugs, test, recipe and well were not walked (55-action budget spent); the nightly whole-game route covers them.
- Cost 3.5632 credits for 52 actions.
