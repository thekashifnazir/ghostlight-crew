# Whole-game check: 2026-11-18

- Run (UTC): 2026-11-18T02:14:37.882Z
- Route: data/playthrough-route.txt (211 lines)
- **Overall: FAIL**
- Chapters reached at their checkpoints: 1, 2, 3, 4, 5, 6 of 1 to 6
- Game ended (final `use 9 56`): yes
- Commands: 197 ok, 14 soft timeouts (engine fine after), 0 failed, 2 refused as not here (each a FAIL)
- Time: 31.8 min

| Line | Command | Kind | Note |
|---|---|---|---|
| 7 | `walk 105` | soft | silence timeout; engine answered after 3 skip(s), 188 s |
| 17 | `talk 53` | soft | conversation went back to the menu with no choices line (1 skip(s)); went on to the next choose |
| 24 | `talk 51` | soft | silence timeout; engine answered after 1 skip(s), 21 s |
| 25 | `use 7 51` | soft | silence timeout; engine answered after 1 skip(s), 3 s |
| 32 | `use 14 166` | soft | silence timeout; engine answered after 1 skip(s), 2 s |
| 78 | `walk 177` | stale | FAIL: refused as not here (target 177 is not a hotspot in the current room (chapter 2, room 18).); ok on retry |
| 80 | `choose 2` | soft | conversation went back to the menu with no choices line (4 skip(s)); went on to the next choose |
| 82 | `walk 177` | stale | FAIL: refused as not here (target 177 is not a hotspot in the current room (chapter 2, room 18).); ok on retry |
| 84 | `choose 3` | soft | silence timeout; engine answered after 1 skip(s), 57 s |
| 92 | `walk 173` | soft | silence timeout; engine answered after 1 skip(s), 3 s |
| 96 | `use 9 51` | soft | silence timeout; engine answered after 1 skip(s), 8 s |
| 172 | `use 21 179` | soft | silence timeout; engine answered after 1 skip(s), 5 s |
| 176 | `look 118` | soft | conversation went back to the menu with no choices line (2 skip(s)); went on to the next choose |
| 181 | `walk 102` | soft | silence timeout; engine answered after 2 skip(s), 63 s |
| 197 | `push 123` | soft | silence timeout; engine answered after 1 skip(s), 11 s |
| 200 | `open 124` | soft | conversation went back to the menu with no choices line (2 skip(s)); went on to the next choose |
