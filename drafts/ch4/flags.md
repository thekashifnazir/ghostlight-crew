# Chapter 4 flags for blind players

## 2026-11-11

### Room 21 (castle grounds)

- Silent hotspots: the small tree exit 100, the castle door exit 101 and the far left door 173 gave no useful line. Hotspot 173 says only "I can't see anything in particular". Tower 179 says only "It's not unusual".
- Fake door: 173 looks like a door but is not an exit. A player may try to walk through it.
- Hidden hotspot: rope 141 is not visible in the dump (visible 0). The player may never find it by pointing.
- Odd name: exit 100 is called ARBOLITO by the engine (Spanish for small tree). The pack label replaces it.
- Two doors close together: 101 (x 82 to 100) and 173 (x 49 to 78) sit side by side, both named DOOR. Only 101 is an exit.
- Loops: both exits lead on (22 and 23). Room 22 leads back here by exit 102.
- Hangs or timeouts: none hit. The engine was not run tonight.
- Refused call: one shell call (`true`) was refused, as expected.

## 2026-11-12

### Room 22 (behind the tree)

- Silent hotspots: exit 102 and the key 180 gave no look line. Branch 140 gave only filler.
- Hidden hotspots: magpie 52 and key 180 were not visible (visible 0) in the dump. A player may not find them by pointing.
- Odd exit: 102 is a thin strip along the whole bottom edge (SALIDA), not a door. A player must walk off the bottom.
- Loops: 102 leads back to room 21 only.
- Hang risk: from the 10 Nov report, looking at or taking the key walks the hero outside the walk area. The next walking command can hang the engine. Use walk to the magpie first.
- Hangs or timeouts tonight: none. The engine was not run.

### Room 23 (entrance hall)

- Silent hotspots: both doors (103, 104), draskis 142, speaker 170, table 171 and picture 174 gave only filler.
- Shared number: two speakers share 170 (x 87 and x 186). Look always hits the first.
- Hidden hotspot: draskis 142 was not visible (visible 0).
- Odd name: DRASKIS is the engine's own word. It may sound odd read aloud.
- Loops: 103 goes back outside to room 21. 104 goes on to room 24, which leads back here by 105.
- Hangs or timeouts tonight: none. The engine was not run.

### Room 24 (tapestry corridor)

- Silent hotspots: stairs 108 gave no line. Doors 105 and 106 gave only filler.
- Shared number: two tapestries share 151 (x 23 and x 226). Look always hits the first.
- Odd look line: the tapestry line says "she", so a tapestry may show a person. A blind player may be confused.
- Odd name: TAPESTRIE is a misspelling. It needs the pack text fix.
- Loops: 105 goes back to room 23. 106 goes to room 26 and 108 to room 27. Both lead back here.
- Hangs or timeouts tonight: none. The engine was not run.

### Run notes

- Refused calls: none. I used only the file tools.
- drascula-live was not needed. Every look line I needed was in the dump or the report.

## 2026-11-13

### Room 26 (Igor's room)

- Silent hotspots: exit 107 gave no line. Wig 143, Igor 51, drawers 167 and portrait 169 gave only filler.
- Blank name: the report says Igor has a blank name until the player talks to him. The pack name "Igor" may be heard too early.
- Odd look lines: calendar 163 says it is Elvis. Book 168 is a tax-forms joke. Window 164 says it is scary. A blind player may find the tone odd.
- Loops: 107 goes back to room 24 only.
- Hangs or timeouts: none. The engine was not run.

### Room 27 (upstairs landing)

- Silent hotspots: stairs 109, doors 110, 112 and 118 gave no line. Door 116 gave only filler.
- Shared number: four fake doors share 166 (x 103, 137, 184, 280). Look always hits the first. None is an exit.
- Fake doors: 116 and the four 166 doors look like exits but are not. West wing 150 is not an exit either; the game says "no way".
- Conflict: the report lists 116 as an exit to room 31. The dump says door 0 with no destination. A reviewer should check.
- Odd look line: picture 175 has a garbled byte in "toupee" in the dump.
- Loops: 109 goes down to room 24, which leads back up by 108. 110, 112 and 118 each go on to rooms 28, 29 and 34, which lead back here.
- Hangs or timeouts: none. The engine was not run.

### Room 28 (dark storeroom)

- Silent hotspots: box 200 gave no line. Every other hotspot, and exit 111, says the room is too dark.
- Shared number: eight hotspots (boxes, drawers, trunks, barrel) share 999. Look always hits the first.
- Dark room: every look gets the same reply. A blind player learns nothing about the objects.
- Odd exit: 111 is a tall strip along the whole right edge, not a door.
- Loops: 111 goes back to room 27 only.
- Hangs or timeouts: none. The engine was not run.

### Run notes

- Refused calls: none. One test shell call (`echo hi`) was not refused, though the brief said it would be. I used no shell after that.
- drascula-live was not needed. Every look line I needed was in the dump.
