# Surveyor run, 8 Nov 2026: chapter 2 milestones

Reported by the `surveyor` bot, capped at 12 credits. Stopped by a human at the cap.

## Milestones cleared: 4 of 22

| Milestone | Flag | How |
|---|---|---|
| ch2.handbag | 20 | open trunk 183 |
| ch2.money | 23 | open handbag 22 |
| ch2.cigarettes | 26 | coins on machine 188, push |
| ch2.von-braun-named | 40 | talk 53, choose 3, choose 4 (end) |

The first 3 are saved in checkpoint `drascula.010` (in `.saves/`, not committed).

## Rule proven

A conversation's flag only sets when the conversation **ends**. Choose the line, then choose goodbye, then check the flag. This matches the engine source (talk sequence 17 sets flag 40; the flag commits at the end of the conversation).

## Transport flakiness (sent back to the Ghostlight build)

`talk 53` settled at once by hand but timed out after 60 s in the driver, from the same slot in the same room. The native transport sometimes misses a command settling, so the driver can't tell slow from hung, and each miss costs 60 s. A Kiro bugfix chat in the Ghostlight repo is reproducing it (50 loops of `talk 53`, `choose 3`, `choose 4` from a copy of slot 10) before fixing it.

## Not done

Saving room 19 (slot 5), the room 20 survey, its report and its draft pack JSON. Room 20 is one clean playthrough away once the transport fix lands.

## Cost

The game tools report no credits. The run used the bot's own compute and stopped at the 12-credit cap.
