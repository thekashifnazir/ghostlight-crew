# Whole-game check: 2026-11-12

- Run (UTC): 2026-11-12T08:46:14.080Z
- Route: data/playthrough-route.txt (211 lines)
- **Overall: FAIL**
- Chapters reached at their checkpoints: 1, 2 of 1 to 6
- Game ended (final `use 9 56`): no
- Commands: 72 ok, 5 soft timeouts (engine fine after), 0 failed
- Time: 13.5 min

> Fatal: engine stopped answering after line 80 (choose 2)

| Line | Command | Kind | Note |
|---|---|---|---|
| 7 | `walk 105` | soft | silence timeout; engine answered after 1 skip(s), 4 s |
| 24 | `talk 51` | soft | silence timeout; engine answered after 1 skip(s), 9 s |
| 25 | `use 7 51` | soft | silence timeout; engine answered after 1 skip(s), 3 s |
| 32 | `use 14 166` | soft | silence timeout; engine answered after 1 skip(s), 1 s |
| 78 | `walk 177` | retry | refused until the scene settled; ok on retry |
| 80 | `choose 2` | soft | silence timeout; engine never answered (7 skips) |
