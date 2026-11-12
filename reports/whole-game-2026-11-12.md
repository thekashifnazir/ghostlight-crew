# Whole-game check: 2026-11-12

- Run (UTC): 2026-11-12T08:32:06.071Z
- Route: data/playthrough-route.txt (211 lines)
- **Overall: FAIL**
- Chapters reached at their checkpoints: 1, 2 of 1 to 6
- Game ended (final `use 9 56`): no
- Commands: 72 ok, 6 soft timeouts (engine fine after), 4 failed
- Time: 13.0 min

> Fatal: engine stopped answering after line 85 (save 14)

Trace before the first failed command:

- line 67 `use 12 54`: +earplugs; -book; flags 39; "SORRY... / REALLY? / WOULD YOU LIKE THIS BOOK?. IT HAS SOME SCORES FROM TCHAIKOVSKY / WHAT? OF COURSE I'M INTERESTED / THANK GOD! I CAN PLAY A DIFFERENT SONG NOW! / I GUESS YOU CAN KEEP MY EAR-PLUGS / SORRY... / REALLY? "
- line 68 `save 13`: 
- line 69 `walk 159`: room 14->12
- line 70 `walk 151`: room 12->10
- line 71 `walk 146`: room 10->4; flags 5,11
- line 72 `walk 126`: room 4->2
- line 73 `walk 175`: room 2->17
- line 74 `walk 177`: room 17->18
- line 75 `use 11 50`: +ear with earplug; -earplugs; flags 29; "ALL RIGHT. I GOT THE EAR-PLUGS IN / ALL RIGHT. I GOT THE EAR-PLUGS IN"
- line 76 `talk 55`: "AAHH.... / WHAT DO YOU WANT NOW? / choices: 1 I HAVE COME TO GET INTO THAT CABIN AGAIN. / 2 I AM READY TO FACE YOUR TEST. / 3 ALL RIGHT OLD MAN. I CAME FOR MY MONEY. / 4 NO, NOTHING. I WAS JUST LEAVING."
- line 77 `choose 2`: +earplugs,one coin; -ear with earplug; flags 22; "I AM READY TO FACE YOUR TEST. / OK, WAIT A MINUTE / STAND IN THE CENTER OF THE ROOM, PLEASE / ALL RIGHT. LET'S GET TO IT / I HAVE TO ADMIT IT. YOU REALLY HAVE WHAT IT TAKES TO FIGHT AGAINST THE VAMPIRES / HEY, TAKE YOUR "
- line 78 `walk 177`: error: target 177 is not a hotspot in the current room (chapter 2, room 18).
- state now: ch 2 room 17; objects: 176 SALIDA, 177 DOOR

| Line | Command | Kind | Note |
|---|---|---|---|
| 7 | `walk 105` | soft | silence timeout; engine answered after 1 skip(s), 4 s |
| 24 | `talk 51` | soft | silence timeout; engine answered after 1 skip(s), 9 s |
| 25 | `use 7 51` | soft | silence timeout; engine answered after 1 skip(s), 3 s |
| 32 | `use 14 166` | soft | silence timeout; engine answered after 1 skip(s), 1 s |
| 58 | `choose 2` | soft | silence timeout; engine answered after 1 skip(s), 9 s |
| 78 | `walk 177` | failed | target 177 is not a hotspot in the current room (chapter 2, room 18). |
| 79 | `talk 55` | failed | target 55 is not a hotspot in the current room (chapter 2, room 17). |
| 80 | `choose 2` | failed | no conversation is open |
| 81 | `choose 4` | failed | no conversation is open |
| 85 | `save 14` | soft | silence timeout; engine never answered (8 skips) |
