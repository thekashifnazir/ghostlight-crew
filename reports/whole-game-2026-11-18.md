# Whole-game check: 2026-11-18

- Run (UTC): 2026-11-18T08:26:57.120Z
- Route: data/playthrough-route.txt (211 lines)
- **Overall: PASS**
- Chapters reached at their checkpoints: 1, 2, 3, 4, 5, 6 of 1 to 6
- Game ended (final `use 9 56`): yes
- Commands: 199 ok, 12 soft timeouts (engine fine after), 0 failed, 0 refused as not here (each a FAIL)
- Time: 30.4 min

| Line | Command | Kind | Note |
|---|---|---|---|
| 7 | `walk 105` | soft | silence timeout; engine answered after 3 skip(s), 186 s |
| 24 | `talk 51` | soft | silence timeout; engine answered after 1 skip(s), 20 s |
| 25 | `use 7 51` | soft | silence timeout; engine answered after 1 skip(s), 3 s |
| 32 | `use 14 166` | soft | silence timeout; engine answered after 1 skip(s), 1 s |
| 78 | `walk 177` | late | refused as not here (target 177 is not a hotspot in the current room (chapter 2, room 18).); ok 5 s later with no snapshot, so the engine reported the move itself |
| 80 | `choose 2` | soft | conversation went back to the menu with no choices line (4 skip(s)); went on to the next choose |
| 82 | `walk 177` | late | refused as not here (target 177 is not a hotspot in the current room (chapter 2, room 18).); ok 5 s later with no snapshot, so the engine reported the move itself |
| 84 | `choose 3` | soft | silence timeout; engine answered after 1 skip(s), 57 s |
| 92 | `walk 173` | soft | silence timeout; engine answered after 1 skip(s), 2 s |
| 96 | `use 9 51` | soft | silence timeout; engine answered after 1 skip(s), 8 s |
| 172 | `use 21 179` | soft | silence timeout; engine answered after 1 skip(s), 5 s |
| 181 | `walk 102` | soft | silence timeout; engine answered after 2 skip(s), 62 s |
| 197 | `push 123` | soft | silence timeout; engine answered after 1 skip(s), 11 s |
| 200 | `open 124` | soft | conversation went back to the menu with no choices line (2 skip(s)); went on to the next choose |
