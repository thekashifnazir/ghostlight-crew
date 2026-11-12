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
