# Drascula — Chapter 2 hotspot coverage

**Date:** 2026-11-09  
**Surveyed by:** surveyor (via drascula-live engine, driven from chat)  
**Rooms visited:** 17 of 17 reachable chapter-2 rooms — none unreachable

## What this checks

I loaded a chapter-2 save, walked into every chapter-2 room, and used **look** on every hotspot the engine lists. For each hotspot I record what the game speaks back. A blind player relies entirely on that spoken line, so a hotspot is a problem when:

- **No speech** — `look` says nothing at all. The player gets silence and no way to tell the hotspot exists or what it is.
- **Generic filler** — the engine falls back to a stock line ("It's not unusual", "There is nothing special about it", "I can't see anything in particular"). Technically a response, but it gives the player no real information.
- **"Nothing happened."** — the no-op response.

The three filler lines are picked at random, so the same object can show a different filler (or, for a well-authored object, differ run to run). The **no-speech** flags are stable — those objects have no spoken line at all. Treat the filler list as "no real description authored," not as an exact per-run transcript.

Exit arrows (walkable hotspots with no object entry in the pack) are listed separately; most speak nothing by design, which is expected for a pure exit.

## Note on the save slot

> The request named **slot 20 as chapter 2**. The engine loads **slot 20 into chapter 3, room 20** — it is a chapter-boundary save, not a chapter-2 state. The chapter-2 saves are slots 5 and 9–18. I ran this survey from **slot 18**, the furthest chapter-2 checkpoint, because it has the most milestones done and therefore opens every chapter-2 room (locked doors like the church are already open). From earlier chapter-2 saves, rooms 6 and 7 sit behind a locked door and cannot be reached.

## Summary

| Metric | Count |
|---|---|
| Chapter-2 rooms surveyed | 17 |
| Object hotspots looked at | 58 |
| Objects with **no speech** | 4 |
| Objects with **generic filler** | 13 |
| Objects answering **"Nothing happened."** | 0 |
| Exit hotspots (listed, mostly silent by design) | 36 |

## Flagged hotspots (what a blind player can't get past)

### Objects with no spoken description at all

- Room 3 "Cemetery" — **gravestone** (id 130)
- Room 7 "Church nave" — **candle** (id 190)
- Room 14 "Inn bar" — **pianist** (id 54)
- Room 18 "Von Braun's den" — **Von Braun** (id 55)

### Objects answering only with generic filler

- Room 1 "Church gate" — **blue window** (id 120): "THERE IS NOTHING SPECIAL ABOUT IT"
- Room 6 "Church vestry" — **statue** (id 999): "IT'S NOT UNUSUAL"
- Room 12 "Street outside the inn" — **street lamp** (id 155): "I CAN'T SEE ANYTHING IN PARTICULAR"
- Room 14 "Inn bar" — **bartender** (id 52): "THERE IS NOTHING SPECIAL ABOUT IT"
- Room 14 "Inn bar" — **drunk** (id 53): "IT'S NOT UNUSUAL"
- Room 14 "Inn bar" — **piano** (id 199): "I CAN'T SEE ANYTHING IN PARTICULAR"
- Room 16 "Guest bedroom" — **bed** (id 184): "THERE IS NOTHING SPECIAL ABOUT IT"
- Room 16 "Guest bedroom" — **window** (id 186): "IT'S NOT UNUSUAL"
- Room 18 "Von Braun's den" — **writing on the wall** (id 180): "THERE IS NOTHING SPECIAL ABOUT IT"
- Room 18 "Von Braun's den" — **garlic** (id 179): "IT'S NOT UNUSUAL"
- Room 18 "Von Braun's den" — **garlic** (id 179): "I CAN'T SEE ANYTHING IN PARTICULAR"
- Room 18 "Von Braun's den" — **garlic** (id 179): "THERE IS NOTHING SPECIAL ABOUT IT"
- Room 18 "Von Braun's den" — **garlic** (id 179): "IT'S NOT UNUSUAL"

### Objects answering "Nothing happened."

_None._

## Per-room detail

### Room 1 — Church gate

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 118 | boarded-up gate | object | THAT'S THE SECOND BIGGEST DOOR I'VE SEEN IN MY LIFE NOT REALLY | ok |
| 119 | tower window | object | THE WINDOW IS BOARDED UP | ok |
| 120 | blue window | object | THERE IS NOTHING SPECIAL ABOUT IT | generic filler |
| 121 | path back to the valley | exit | _(silent)_ | silent (exit) |
| 122 | path to the cemetery | exit | _(silent)_ | silent (exit) |

### Room 2 — Valley map

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 123 | church | exit | IT'S NOT UNUSUAL | speaks |
| 125 | village | exit | I CAN'T SEE ANYTHING IN PARTICULAR | speaks |
| 127 | cemetery | exit | THERE IS NOTHING SPECIAL ABOUT IT | speaks |
| 175 | hut | exit | IT'S NOT UNUSUAL | speaks |

### Room 3 — Cemetery

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 124 | path up to the church gate | exit | _(silent)_ | silent (exit) |
| 128 | path between the dragon pillars | exit | I CAN'T SEE ANYTHING IN PARTICULAR | speaks |
| 129 | flat tomb | object | IT'S A COFFIN IN THE SHAPE OF A CROSS | ok |
| 130 | gravestone | object | _(silent)_ | **NO DESCRIPTION** |
| 131 | gravestone, left | object | I'LL BE BACK IN FIFTEEN MINUTES | ok |
| 132 | gravestone, front | object | IT'S FORBIDDEN TO PUT UP POSTERS | ok |
| 133 | mausoleum | object | IT'S UNCLE DESIDERIO'S PANTHEON! | ok |
| 134 | way round behind the church fence | exit | _(silent)_ | silent (exit) |
| 165 | fence spike | object | HEY, THIS SPIKE SEEMS A LITTLE BIT LOOSE! I HOPE YOU WON'T COMPLAIN ABOUT NOT GETTING ANY CLUES FROM ME | ok |
| 166 | creeper | object | IT'S FERNAN, THE PLANT | ok |
| 211 | stone dragons | object | AREN'T THESE BUGS REALLY CUTE? | ok |

### Room 4 — Edge of the village

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 126 | path out into the valley | exit | _(silent)_ | silent (exit) |
| 145 | road back to the square | exit | _(silent)_ | silent (exit) |
| 189 | barrel | object | A COMPLETELY SEALED BARREL | ok |
| 207 | castle | object | MAN, THIS CASTLE IS REALLY GLOOMY | ok |
| 208 | forest | object | IT'S A TYPICAL TRANSILVANIAN FOREST, WITH TREES | ok |
| 209 | poster | object | GARCIA, CANDY STORE. SWEETS AND BUBBLE GUM | ok |
| 210 | house door | object | A VERY NICE DOOR | ok |

### Room 5 — Behind the church fence

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 135 | way back to the cemetery | exit | THERE IS NOTHING SPECIAL ABOUT IT | speaks |
| 136 | boarded window | exit | _(silent)_ | silent (exit) |
| 213 | other window | object | IT'S TOTALLY BOARDED UP WITH PLANKS | ok |
| 212 | moon | object | THE MOON IS A SATELLITE THAT TURNS AROUND THE EARTH WITH A REVOLUTION PERIOD OF 28 DAYS | ok |

### Room 6 — Church vestry

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 137 | window you climbed in by | exit | _(silent)_ | silent (exit) |
| 138 | arched door into the church | exit | IT'S A DOOR | speaks |
| 139 | drawer | object | A DRAWER IN THE TABLE | ok |
| 143 | wardrobe | object | A SUSPICIOUS WARDROBE | ok |
| 140 | crucifix | object | THAT'S A BEAUTIFUL WOODEN CRUCIFIX. THE ICON DOESN'T REALLY SHOW THE FULL EXTENT OF IT'S BEAUTY | ok |
| 144 | candelabrum | object | IT'S AN ANCIENT CANDELABRUM IT MUST HAVE BEEN HERE SINCE YULE BRINNER HAD HAIR ON HIS HEAD | ok |
| 999 | statue | object | IT'S NOT UNUSUAL | generic filler |

### Room 7 — Church nave

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 142 | double door back to the vestry | exit | _(silent)_ | silent (exit) |
| 164 | small arched door outside | exit | IT'S A DOOR | speaks |
| 169 | altarpiece | object | IT'S A NICE ALTARPIECE | ok |
| 190 | candle | object | _(silent)_ | **NO DESCRIPTION** |

### Room 8 — Lane with a statue

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 160 | lane back to the inn | exit | _(silent)_ | silent (exit) |
| 147 | bin | object | THERE ISN'T ANYTHING ELSE IN THE BUCKET | ok |
| 161 | lane on to the village square | exit | _(silent)_ | silent (exit) |

### Room 9 — Dead-end alley

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 152 | way back to the square | exit | _(silent)_ | silent (exit) |
| 150 | wooden door | object | IT'S A DOOR | ok |
| 51 | blind man | object | IT'S A BLIND MAN WHO CAN'T SEE | ok |

### Room 10 — Village square

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 146 | road to the edge of the village | exit | I CAN'T SEE ANYTHING IN PARTICULAR | speaks |
| 148 | street back to the inn | exit | THERE IS NOTHING SPECIAL ABOUT IT | speaks |
| 149 | dead-end alley | exit | IT'S NOT UNUSUAL | speaks |

### Room 12 — Street outside the inn

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 151 | street to the village square | exit | _(silent)_ | silent (exit) |
| 154 | balconies | object | IT'S VERY HIGH! | ok |
| 154 | balconies | object | IT'S VERY HIGH! | ok |
| 155 | street lamp | object | I CAN'T SEE ANYTHING IN PARTICULAR | generic filler |
| 156 | inn door | exit | IT'S A DOOR | speaks |
| 158 | archway into the side lane | exit | _(silent)_ | silent (exit) |

### Room 14 — Inn bar

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 159 | stairs down to the street | exit | _(silent)_ | silent (exit) |
| 162 | curtained doorway to the guest rooms | exit | _(silent)_ | silent (exit) |
| 171 | stone arch to the back room | exit | _(silent)_ | silent (exit) |
| 52 | bartender | object | THERE IS NOTHING SPECIAL ABOUT IT | generic filler |
| 54 | pianist | object | _(silent)_ | **NO DESCRIPTION** |
| 53 | drunk | object | IT'S NOT UNUSUAL | generic filler |
| 199 | piano | object | I CAN'T SEE ANYTHING IN PARTICULAR | generic filler |
| 200 | small poster | object | IT SAYS "PLEASE, DO NOT THROW FOOD TO THE PIANIST" | ok |
| 203 | skull | object | THAT'S A NICE SKULL WITH A VERY PENETRATING LOOK, HA, HA, HA, HA, THAT WAS GOOD! | ok |
| 202 | burger poster | object | BEST BURGERS ON THIS SIDE OF THE DANUBE, ONLY 325! | ok |
| 201 | menu board | object | OMELETTE, 1.00. FRIED FISH, 0.80, MAYONNAISE POTATOES, 1.10 | ok |
| 204 | bin | object | IT'S A BIN | ok |

### Room 15 — Inn back room

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 172 | stone arch back to the bar | exit | _(silent)_ | silent (exit) |
| 188 | vending machine | object | IT'S A CIGARETTE VENDING MACHINE | ok |
| 205 | papers | object | IT'S A BET FOR TONIGHT'S GAME | ok |
| 206 | red curtain | object | I WONDER WHAT IS BEHIND THAT | ok |

### Room 16 — Guest bedroom

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 163 | door to the stairs | exit | _(silent)_ | silent (exit) |
| 183 | trunk | object | IT'S JUST A TRUNK | ok |
| 184 | bed | object | THERE IS NOTHING SPECIAL ABOUT IT | generic filler |
| 185 | wardrobe | object | A SUSPICIOUS WARDROBE | ok |
| 186 | window | object | IT'S NOT UNUSUAL | generic filler |
| 187 | mirror | object | OH MY GOD! I HAVE NO REFLECTION! I'M A VAMPIRE! OH...JESUS, IT'S JUST A DRAWING! | ok |

### Room 17 — Outside Von Braun's hut

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 176 | path back to the valley | exit | _(silent)_ | silent (exit) |
| 177 | front door | exit | IT'S A DOOR | speaks |

### Room 18 — Von Braun's den

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 178 | doorway out | exit | I CAN'T SEE ANYTHING IN PARTICULAR | speaks |
| 180 | writing on the wall | object | THERE IS NOTHING SPECIAL ABOUT IT | generic filler |
| 182 | book | object | "SLEEPING BEAUTY" FROM TCHAIKOVSKY, OR CHOIFRUSKY, OR WHATEVER IT IS | ok |
| 181 | certificates | object | IT'S A VAMPIRE'S HUNTER DIPLOMA, OFFICIALLY APPROVED BY OXFORD UNIVERSITY | ok |
| 181 | certificates | object | IT'S A VAMPIRE'S HUNTER DIPLOMA, OFFICIALLY APPROVED BY OXFORD UNIVERSITY | ok |
| 179 | garlic | object | IT'S NOT UNUSUAL | generic filler |
| 179 | garlic | object | I CAN'T SEE ANYTHING IN PARTICULAR | generic filler |
| 179 | garlic | object | THERE IS NOTHING SPECIAL ABOUT IT | generic filler |
| 179 | garlic | object | IT'S NOT UNUSUAL | generic filler |
| 55 | Von Braun | object | _(silent)_ | **NO DESCRIPTION** |

### Room 19 — Churchyard well

| # | Hotspot | Kind | look response | Flag |
|---|---|---|---|---|
| 170 | doorway back into the church | exit | I CAN'T SEE ANYTHING IN PARTICULAR | speaks |
| 173 | well | exit | THERE IS NOTHING SPECIAL ABOUT IT | speaks |
| 214 | cypress trees | object | HEY! THE SHADOW OF THAT CYPRESS LOOKS PROLONGED TO ME! | ok |

---

_Generated from a live playthrough. Filler lines are the engine's stock fallbacks, so a hotspot showing only filler effectively has no authored description._
