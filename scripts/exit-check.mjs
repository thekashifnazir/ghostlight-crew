// exit-check.mjs: every exit label in Ghostlight's Drascula pack leads where it says.
//
// A screen-reader player can't see where a door goes; they trust the label
// ("door on the far left to the bar"). This rides data/playthrough-route.txt
// (the whole-game route) through the drascula-live MCP server on the native
// engine. The first time the route stands in a room the pack has exits for, it
// saves to a scratch slot, walks each exit the room shows, records the room it
// lands in, and reloads the save before going on. Each landing is compared with
// the pack's "to". Writes reports/exit-check-<date>.md and commits it (no push).
// Zero Kiro credits: no agent is involved.
//
// Per exit: PASS (landed in "to"), WRONG (landed somewhere else), STAYED (walked,
// no room change: locked, or opens later), NOT SHOWN (the room didn't list that
// hotspot at that point in the route), ERROR. Exits never stood next to are
// listed as NOT VISITED.
//
// Usage:  node scripts/exit-check.mjs   (on the VM, under xvfb-run with
//         SDL_AUDIODRIVER=dummy, like ~/bin/ghostlight-whole-game.sh)

import { spawn, execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");                       // ghostlight-crew
const ENGINE = join(REPO, "..", "ghostlight");            // sibling checkout
const MCP_BIN = join(ENGINE, "mcp", "node_modules", ".bin", "tsx");
const SERVER = join(ENGINE, "mcp", "src", "server.ts");
const ROUTE_FILE = join(REPO, "data", "playthrough-route.txt");
const SAVES = mkdtempSync(join(tmpdir(), "exit-check-saves-"));
const SETTLE_POLL_MS = 5_000;
const SETTLE_MAX_MS = 180_000;

// --- route ----------------------------------------------------------------------
const route = readFileSync(ROUTE_FILE, "utf8")
  .split("\n")
  .map((raw, i) => {
    const [cmdPart, ...rest] = raw.split("#");
    const cmd = cmdPart.trim();
    if (!cmd) return null;
    const comment = rest.join("#").trim();
    const [verb, ...nums] = cmd.split(/\s+/);
    const args = nums.map(Number);
    const ck = /^ch(\d) start/.exec(comment);
    const checkpoint = verb === "save" && ck ? Number(ck[1]) : null;
    return { line: i + 1, verb, args, comment, checkpoint };
  })
  .filter(Boolean);

// --- MCP stdio client (same shape as nightly-rooms.mjs) ------------------------
const srv = spawn(MCP_BIN, [SERVER], {
  cwd: ENGINE,
  env: {
    ...process.env,
    DRASCULA_MCP_TRANSPORT: "native",
    DRASCULA_MCP_SAVEPATH: SAVES,
    DRASCULA_MCP_SCUMMVM: join(ENGINE, "vendor", "scummvm", "scummvm"),
    DRASCULA_MCP_GAME: join(ENGINE, "vendor", "game", "drascula"),
    DRASCULA_MCP_EXTRA: join(ENGINE, "vendor", "scummvm", "dists", "engine-data"),
  },
  stdio: ["pipe", "pipe", "pipe"],
});
const stderrLines = [];
srv.stderr.on("data", (d) => {
  const s = d.toString().trim();
  if (s) stderrLines.push(s);
});
let buf = "", nextId = 0;
const pending = new Map();
srv.stdout.on("data", (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let m;
    try { m = JSON.parse(line); } catch { continue; }
    if (m.id != null && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  }
});
srv.on("exit", (code) => {
  for (const [, resolve] of pending) {
    resolve({ error: { message: `server exited (code ${code}): ${stderrLines.slice(-3).join(" | ")}` } });
  }
  pending.clear();
});
function rpc(method, params) {
  return new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}
function jsonOf(r) {
  let text;
  try { text = r.result.content.map((c) => c.text).join("\n"); }
  catch { return { error: (r.error && r.error.message) || JSON.stringify(r) }; }
  try { return JSON.parse(text); } catch { return { _raw: text, error: r.result.isError ? text : undefined }; }
}
async function tool(name, args) {
  return jsonOf(await rpc("tools/call", { name, arguments: args || {} }));
}
const NOT_HERE = /not a hotspot|not in this room|no conversation is open|neither a hotspot/i;
const isTimeout = (j) => /did not settle|busy-skip|busy/i.test(String(j && j.error || ""));

// After a soft timeout the engine is usually sitting in a cutscene waiting for a
// key (measured 12 Nov: the chapter 2 intro never moves on by itself under
// dummy audio, and `state` alone keeps timing out). So: `skip`, then `state`,
// until `state` answers with anything that isn't another silence timeout (a
// refusal during a conversation counts as alive).
// A conversation answer that ends back at the choice menu is a special case
// (measured 12 Nov, line 80 `choose 2` to Von Braun): the speech plays out under
// skips, then the menu comes back with no A11Y_CHOICES line and `state` stays
// silent, so waiting for `state` never ends. When the next route step is a
// `choose` and a skip finds nothing left to skip, the menu is up: carry on.
async function waitSettled(nextIsChoose = false) {
  const t0 = Date.now();
  let skips = 0;
  while (Date.now() - t0 < SETTLE_MAX_MS) {
    const k = await tool("skip");
    skips++;
    if (/game has ended/i.test(String(k && k.error || "")) || (k && k.ended)) {
      return { ok: true, ms: Date.now() - t0, skips, state: { error: "the game has ended" } };
    }
    if (nextIsChoose && /Last A11Y line seen: A11Y_CMD skip\b/.test(String(k && k.error || ""))) {
      return { ok: true, ms: Date.now() - t0, skips, menu: true, state: { note: "back at the choice menu" } };
    }
    const s = await tool("state");
    if (!isTimeout(s)) return { ok: true, ms: Date.now() - t0, skips, state: s };
    await new Promise((r) => setTimeout(r, SETTLE_POLL_MS));
  }
  return { ok: false, ms: Date.now() - t0, skips };
}

function argsFor(verb, a) {
  switch (verb) {
    case "start": return a.length ? { slot: a[0] } : {};
    case "save": return { slot: a[0] };
    case "use": return { item: a[0], target: a[1] };
    case "choose": return { n: a[0] };
    default: return { target: a[0] };
  }
}


// --- pack ---------------------------------------------------------------------
const PACK = JSON.parse(readFileSync(join(ENGINE, "packs", "drascula-en.json"), "utf8"));
const packExits = {};         // room -> [{ id, to, label }]
for (const [room, r] of Object.entries(PACK.rooms)) {
  const ex = Object.entries(r.exits || {}).map(([id, e]) => ({ id: Number(id), to: e.to, label: e.label || e.name || "" }));
  if (ex.length) packExits[Number(room)] = ex;
}
const PROBE_SLOT = 40;
const results = [];           // { room, id, label, to, result, landed, note, line }
const probed = new Set();
const t0 = Date.now();
let fatal = null, routeSteps = 0, routeFailed = 0;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function settledState() {
  let s = await tool("state");
  if (isTimeout(s)) { const w = await waitSettled(); s = w.ok && w.state && !w.state.error ? w.state : await tool("state"); }
  return s;
}
async function reload(room) {
  let s = await tool("start", { slot: PROBE_SLOT });
  if (isTimeout(s) || s.error) s = await settledState();
  if (s.room !== room) throw new Error(`reload of slot ${PROBE_SLOT} came back in room ${s.room}, expected ${room}`);
}
async function probe(s, line) {
  const room = s.room;
  probed.add(room);
  const shown = new Set((s.objects || []).map((o) => o.num));
  const sv = await tool("save", { slot: PROBE_SLOT });
  if (sv.error) { results.push(...packExits[room].map((e) => ({ room, ...e, result: "ERROR", note: `save failed: ${String(sv.error).slice(0, 80)}`, line }))); return; }
  for (const e of packExits[room]) {
    if (!shown.has(e.id)) { results.push({ room, ...e, result: "NOT SHOWN", line }); continue; }
    let j = await tool("walk", { target: e.id });
    let landed = j && j.diff && j.diff.room ? j.diff.room[1] : undefined;
    if (isTimeout(j) || landed === undefined) {
      await pause(1500);
      const after = await settledState();
      if (after && after.room != null) landed = after.room;
    }
    const note = j && j.error && !isTimeout(j) ? String(j.error).slice(0, 100) : "";
    let result;
    if (landed === undefined) result = "ERROR";
    else if (landed === room) result = "STAYED";
    else if (landed === e.to) result = "PASS";
    else result = "WRONG";
    results.push({ room, ...e, result, landed, note, line });
    if (landed !== undefined && landed !== room) await reload(room);
  }
}

// --- replay -------------------------------------------------------------------
try {
  const init = await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "exit-check", version: "1" } });
  if (init.error) throw new Error(`MCP server failed to start: ${init.error.message}`);
  srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  for (const [i, step] of route.entries()) {
    routeSteps++;
    let j = await tool(step.verb, argsFor(step.verb, step.args));
    if (j && j.error && !isTimeout(j) && NOT_HERE.test(String(j.error))) { await pause(3000); await tool("state"); j = await tool(step.verb, argsFor(step.verb, step.args)); }
    if (j && j.ended) break;
    if (isTimeout(j)) {
      const w = await waitSettled(route[i + 1]?.verb === "choose");
      if (!w.ok) throw new Error(`engine stopped answering after line ${step.line}`);
      if (w.state && /game has ended/i.test(String(w.state.error || ""))) break;
    } else if (j && j.error) { routeFailed++; continue; }
    // Only probe when the next step isn't a conversation choice and the engine is idle in a room.
    if (["choose", "save"].includes(route[i + 1]?.verb) || step.verb === "choose") continue;
    const s = await tool("state");
    if (!s || s.error || s.room == null || probed.has(s.room) || !packExits[s.room]) continue;
    if ((s.choices && s.choices.length) || /conversation/i.test(String(s.note || ""))) continue;
    await probe(s, step.line);
  }
  await tool("stop");
} catch (e) {
  fatal = e.message || String(e);
} finally {
  try { srv.kill(); } catch {}
  try { rmSync(SAVES, { recursive: true, force: true }); } catch {}
}

// --- report -------------------------------------------------------------------
for (const [room, ex] of Object.entries(packExits)) {
  if (!probed.has(Number(room))) for (const e of ex) results.push({ room: Number(room), ...e, result: "NOT VISITED" });
}
const tally = {};
for (const r of results) tally[r.result] = (tally[r.result] || 0) + 1;
const total = Object.values(packExits).reduce((n, ex) => n + ex.length, 0);
const date = new Date().toISOString().slice(0, 10);
const minutes = (Date.now() - t0) / 60000;
const order = ["WRONG", "ERROR", "STAYED", "NOT SHOWN", "NOT VISITED", "PASS"];
results.sort((a, b) => order.indexOf(a.result) - order.indexOf(b.result) || a.room - b.room || a.id - b.id);
const lines = [
  `# Exit check: ${date}`, "",
  `- Run (UTC): ${new Date(t0).toISOString()}; ${minutes.toFixed(1)} min; zero Kiro credits`,
  `- Pack: ghostlight packs/drascula-en.json at ${(() => { try { return execFileSync("git", ["-C", ENGINE, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim(); } catch { return "?"; } })()}; ${total} exits in ${Object.keys(packExits).length} rooms`,
  `- Route: data/playthrough-route.txt, ${routeSteps} steps replayed, ${routeFailed} refused`,
  `- **Results: ${order.filter((k) => tally[k]).map((k) => `${tally[k]} ${k}`).join(", ")}**`,
  `- WRONG means the label sends a player somewhere else. STAYED is usually a locked door or one that opens later; check it against the label.`, "",
];
if (fatal) lines.push(`> Fatal: ${fatal}`, "");
lines.push("| Room | Exit | Label | Pack says | Landed | Result | Route line | Note |", "|---|---|---|---|---|---|---|---|");
for (const r of results) lines.push(`| ${r.room} | ${r.id} | ${r.label} | ${r.to ?? ""} | ${r.landed ?? ""} | ${r.result} | ${r.line ?? ""} | ${(r.note || "").replace(/\|/g, "/")} |`);
const reportRel = join("reports", `exit-check-${date}.md`);
mkdirSync(join(REPO, "reports"), { recursive: true });
writeFileSync(join(REPO, reportRel), lines.join("\n") + "\n");
try {
  execFileSync("git", ["-C", REPO, "add", reportRel]);
  execFileSync("git", ["-C", REPO, "commit", "-q", "-m", `exit-check: ${tally.WRONG || 0} wrong, ${tally.PASS || 0} pass ${date}`, "--", reportRel]);
} catch (e) { console.error(`commit: ${String(e.stderr || e.message).trim()}`); }
console.log(lines.slice(0, 6).join("\n"));
process.exit(0);
