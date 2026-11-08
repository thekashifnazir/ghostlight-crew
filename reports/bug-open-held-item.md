# Bug: `open` can't address a held inventory item

## Summary
Milestone ch2.money is blocked. The player opens B.J.'s handbag (a carried item) to get the money and coins (sets flag 23). The `open` tool rejects the carried item before it reaches the engine.

## Where the rejection comes from
**Not the engine.** The engine accepts held items. The rejection is drascula-mcp's own target check — `rejectBadTarget` in `mcp/src/tools.ts` — which validates `target` only against the current room's hotspots and refuses anything else, including an item in inventory.

## Proven path (raw results, chapter-2 save slot 9)
1. `open 183` (trunk in room 16) → diff has `invAdded: [{id: 22, name: handbag}]`, flags 19 and 20 set, text "I'VE FOUND B.J.'S HANDBAG!". Handbag is now carried.
2. `inventory` → shows item 22 (handbag) held, alongside 28 (phone).
3. `open 22` → **error from drascula-mcp**:
   `"target 22 is not a hotspot in the current room (chapter 2, room 16)."`
   `validTargets: [163, 183, 184, 185, 186, 187]` (room hotspots only).

## Root cause
`rejectBadTarget` resolves `target` against room hotspots only. Item 22 is in inventory, not on the room's hotspot list, so the MCP layer rejects it. The engine would have accepted it.

## The fix
Let the target check accept an inventory item id as well as a room hotspot — the way the `use` tool already documents its `target` can be "an inventory item id". Applies to `open`, and likely `take`/`close` if any milestone acts on a carried item. Pass the held-item id straight through to the engine instead of rejecting it.

Replay test to add: after the trunk opens and adds item 22, `open 22` adds money (id 7) and coins (id 18) and sets flag 23.

## Blast radius
This blocks the whole chapter-2 chain: flag 23 → money → buy the sickle → cut the leaves ingredient → the brew → the well. Room 20 stays unreachable until the MCP target check lets a held item through.

## Status
Live driving via the MCP tools works otherwise: `start {slot}` honours the slot, and every native command logs send/settled/timeout on stderr. The chapter-2 save (slot 9, chapter 2 room 14) is in `/Users/kash/Code/showcase/ghostlight-crew/.saves/`.
