#!/usr/bin/env python3
"""hint-walk-prompt.py: write a hint-walker prompt per chapter from Ghostlight's Drascula pack.

Usage: hint-walk-prompt.py <pack.json> <out-dir> <ghostlight-commit> <chapters>
  chapters: comma list of N:slot:cap, slot "None" for a fresh game (chapter 1),
  e.g. 1:None:15,2:92:55,3:93:25,4:94:45,5:95:35,6:96:20
Each prompt lists the pack's names (what a Ghostlight player sees), because the raw
engine names are Spanish or leftovers (17 Nov: chapter 6 run 1 took "yourself" for
"your hand", both HACKER in the engine). Used by hint-walk-changed.sh.
"""
import json,sys,os
pack,S,REV,CHS=sys.argv[1:5]
d=json.load(open(pack))
def done(m):
    w=m.get('when')
    if w is None: return 'the chapter changes' if m.get('end') else 'see the game'
    if 'chapter' in w: return f"you are in chapter {w['chapter']} with control (on start)"
    if 'any' in w: return ' OR '.join(done({'when':x}) for x in w['any'])
    p=[]
    if 'flags' in w: p+=[f"flag {k} is {v}" for k,v in w['flags'].items()]
    if 'has' in w: p+=[f"item {i} is in the inventory" for i in w['has']]
    if 'lacks' in w: p+=[f"item {i} is not held" for i in w['lacks']]
    return ' and '.join(p)
rooms=d['rooms']; rooms=rooms if isinstance(rooms,list) else [dict(v,id=k) for k,v in rooms.items()]
import os
CH=[tuple(int(x) if x!='None' else None for x in t.split(':')) for t in CHS.split(',')]
for ch,slot,cap in CH:
    ms=[m for m in d['milestones'] if m.get('chapter')==ch]
    lines=[f'{i}. {m["id"]} "{m["title"]}". Answer: "{m["hints"]["answer"]}" Done when {done(m)}.' for i,m in enumerate(ms,1)]
    rl=[]
    for r in rooms:
        if ch in (r.get('chapters') or []):
            ex='; '.join(f'{k} {v.get("label") or v.get("name")}' for k,v in (r.get('exits') or {}).items())
            ob='; '.join(f'{k} {v.get("name")}' for k,v in (r.get('objects') or {}).items())
            rl.append(f'- Room {r["id"]} "{r.get("name")}". Exits: {ex or "none"}. Objects: {ob or "none"}.')
    il='; '.join(f'{i["id"]} {i["name"]}' for i in d['items'] if ch in (i.get('chapters') or []))
    p=f'''You are the Ghostlight Crew's hint walker. Check that a player who follows Drascula's chapter {ch} hint ANSWERS really gets through chapter {ch}. A FIX finding is as useful as a PASS; report honestly.

Use your drascula-live tools. First call start {'with slot '+str(slot)+' (the chapter '+str(ch)+' start save)' if slot else 'with no slot (a fresh game, chapter 1)'}, then state and inventory. Call tools one at a time, never in parallel.

What the player sees. The tools give the engine's raw names, which are often Spanish or leftovers (two objects can share a name). A Ghostlight player never sees those: they see the names below, from the pack. Match the answer's words to THESE names and use the id next to each. "Yourself" is the hero, object 50.
''' + '\n'.join(rl) + f'''
- Inventory items this chapter: {il}.

The chapter {ch} milestones, in the order a player meets them (from ../ghostlight/packs/drascula-en.json, ghostlight {REV}). The first one is reached on start: mark it from the start state, then do the steps under the later milestones.
''' + '\n'.join(lines) + f'''

Rules: turn ONLY each answer's text into game actions, using the names above; don't use other knowledge of the game. At most {cap} game actions in total. Call state after each action to check the milestone. If an answer can't be followed, mark that milestone FIX, say exactly which word you couldn't match, and KEEP GOING: try every later milestone. If an action times out, call state before deciding. Call stop when done.

Then write reports/hint-walk-ch{ch}.md:
# Hint walk: chapter {ch}
Run by the Crew hint walker (hint-walker-agent, claude-haiku-5.5) on the Crew VM, native engine, from {'the chapter '+str(ch)+' start save' if slot else 'a fresh game'}, against ghostlight {REV}, using the pack's names.
| Milestone | Answer | Actions | Result | Evidence |
One row per milestone; Actions lists the tool calls you made (e.g. take 101); Result is PASS or FIX; Evidence quotes what the tools returned that proves it (room, flag, item, said line), or what went wrong.
## Notes
Actions used, and anything odd (timeouts, lost items, retries).
## Suggested fixes
For FIX rows only: the answer text you'd suggest instead, and why. "None" if all passed.
Under 50 lines.
'''
    open(f'{S}/hint-walker-ch{ch}-prompt.txt','w').write(p); print(ch, len(ms),'milestones', len(rl),'rooms', len(p),'chars')
