// nightly-rooms.mjs — nightly Drascula room survey.
//
// Starts the drascula-live MCP server over stdio (same command + env as the
// surveyor ability), loads save slot 11, walks rooms 9 -> 3 -> 5, and for each
// room records whether the room description was spoken and the per-step elapsed
// time (flagging any step over 10s). Writes reports/nightly-<date>.md, then
// `git add` + `git commit` that one file. No push. READ-ONLY on the game: it
// only loads the save and walks; it never saves or mutates game state.
//
// Usage:  node scripts/nightly-rooms.mjs
// Env it sets for the server (mirrors the drascula-live ability):
//   DRASCULA_MCP_TRANSPORT=native
//   DRASCULA_MCP_SAVEPATH=<repo>/.saves

import { spawn, execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { liveCheck } from "./nightly-live.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");                       // ghostlight-crew
const SHOWCASE = join(REPO, "..");                        // showcase
const ENGINE = join(SHOWCASE, "ghostlight");              // ghostlight (engine+mcp+packs)
const MCP_BIN = join(ENGINE, "mcp", "node_modules", ".bin", "tsx");
const SERVER = join(ENGINE, "mcp", "src", "server.ts");
const SAVES = join(REPO, ".saves");
const PACK = join(ENGINE, "packs", "drascula-en.json");

const SLOT = 11;
const ROUTE = [9, 3, 5];                                  // rooms to walk, in order
const HANG_LIMIT_MS = 10_000;                             // a single step over this = fail

// --- room graph from the pack, so navigation uses real exits (like dras-full) ---
const { default: pack } = await import(PACK, { with: { type: "json" } });
const GRAPH = {};
for (const n of Object.keys(pack.rooms)) {
  const ex = pack.rooms[n].exits || {};
  GRAPH[n] = [];
  for (const e of Object.keys(ex)) {
    if (ex[e].to != null) GRAPH[n].push({ exit: Number(e), to: Number(ex[e].to) });
  }
}
function pathExits(from, to) {
  if (from === to) return [];
  const q = [[from, []]], seen = new Set([from]);
  while (q.length) {
    const [cur, acc] = q.shift();
    for (const { exit, to: nx } of (GRAPH[cur] || [])) {
      if (seen.has(nx)) continue;
      const acc2 = acc.concat(exit);
      if (nx === to) return acc2;
      seen.add(nx);
      q.push([nx, acc2]);
    }
  }
  return null;
}

// --- MCP stdio client ---------------------------------------------------------
// The native transport resolves its engine paths (ScummVM binary, game data,
// extrapath) RELATIVE to the server's working directory, so the child must run
// with cwd = the ghostlight engine dir. We also pass the paths absolutely via
// env so the launch does not depend on cwd alone.
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
// If the server process dies during startup, fail fast instead of hanging on
// the initialize await.
srv.on("exit", (code) => {
  if (code && code !== 0) {
    for (const [, resolve] of pending) {
      resolve({ error: { message: `server exited (code ${code}): ${stderrLines.slice(-5).join(" | ")}` } });
    }
    pending.clear();
  }
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

function rpc(method, params) {
  return new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}
function textOf(r) {
  try { return r.result.content.map((c) => c.text).join("\n"); }
  catch { return JSON.stringify(r.result || r.error); }
}
function jsonOf(r) {
  try { return JSON.parse(textOf(r)); } catch { return { _raw: textOf(r) }; }
}
// Call a tool and measure wall-clock time for that single step.
async function timedTool(name, args) {
  const t0 = Date.now();
  const r = await rpc("tools/call", { name, arguments: args || {} });
  const ms = Date.now() - t0;
  return { j: jsonOf(r), ms };
}
async function state() {
  return jsonOf(await rpc("tools/call", { name: "state", arguments: {} }));
}
// This engine's accessible "room description" is the room's named hotspots
// (objects) — the a11y layer announces the room by the hotspots it exposes
// (e.g. SALIDA, DOOR, BLIND-MAN). A room whose state returns named objects has
// "spoken" its description; an empty object list means nothing was announced.
function roomDescription(roomState) {
  const objs = (roomState && roomState.objects) || [];
  const names = objs.map((o) => o && o.name).filter(Boolean);
  return names;
}

const results = [];   // one entry per surveyed room
let fatal = null;

try {
  const init = await rpc("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "nightly-rooms", version: "1" },
  });
  if (init.error) throw new Error(`MCP server failed to start: ${init.error.message || JSON.stringify(init.error)}`);
  srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

  // Load the save slot (READ-ONLY: load only, never save).
  const { j: started, ms: startMs } = await timedTool("start", { slot: SLOT });
  if (started.error) throw new Error(`start slot ${SLOT} failed: ${started.error}`);
  const startRoom = started.room;

  // The start reply is itself the first room's state; count it as a step.
  results.__startRoom = startRoom;

  // Walk to each target room in order, timing every walk step. For each target
  // room: did it announce a description (named hotspots), and the slowest step.
  for (const target of ROUTE) {
    let cur = (await state()).room;
    let slowestMs = startMs; // the load/first-arrival cost counts toward the first room
    const steps = [];
    let reached = cur === target;
    let stepErr = null;

    for (let hop = 0; hop < 20 && !reached; hop++) {
      cur = (await state()).room;
      if (cur === target) { reached = true; break; }
      const path = pathExits(cur, target);
      if (!path || !path.length) { stepErr = `no path ${cur} -> ${target}`; break; }
      const { j, ms } = await timedTool("walk", { target: path[0] });
      steps.push({ walk: path[0], ms });
      slowestMs = Math.max(slowestMs, ms);
      if (j.error) { stepErr = `walk ${path[0]} failed: ${j.error}`; break; }
      cur = (await state()).room;
      if (cur === target) { reached = true; break; }
    }

    // Read the room's accessible description (its named hotspots) on arrival.
    let names = [];
    if (reached) {
      const s = await state();
      names = roomDescription(s);
    }
    const descriptionSpoken = names.length > 0;
    const hang = slowestMs > HANG_LIMIT_MS;
    const pass = reached && descriptionSpoken && !hang && !stepErr;
    results.push({
      room: target,
      reached,
      descriptionSpoken,
      descriptionPreview: names.join(", ").slice(0, 160),
      slowestStepMs: slowestMs,
      hang,
      steps,
      error: stepErr,
      pass,
    });
  }

  await rpc("tools/call", { name: "stop", arguments: {} });
} catch (e) {
  fatal = e.message || String(e);
} finally {
  try { srv.kill(); } catch {}
}

// --- live-site check ----------------------------------------------------------
// After the room survey (which only touches the local engine), run the deployed
// site smoke check. It never throws: on any failure it returns FAIL rows so the
// report still renders. Overall PASS requires BOTH parts to pass.
let live = { rows: [], overall: "FAIL" };
try {
  live = await liveCheck();
} catch (e) {
  live = { rows: [{ step: "live", pass: false, ms: 0, note: `fatal: ${e.message || e}` }], overall: "FAIL" };
}

// --- build the report ---------------------------------------------------------
const now = new Date();
const date = now.toISOString().slice(0, 10);              // YYYY-MM-DD (UTC)
const roomsPass = !fatal && results.length === ROUTE.length && results.every((r) => r.pass);
const livePass = live.overall === "PASS";
const overallPass = roomsPass && livePass;

const lines = [];
lines.push(`# Nightly room survey — ${date}`);
lines.push("");
lines.push(`- Run (UTC): ${now.toISOString()}`);
lines.push(`- Save slot: ${SLOT}`);
lines.push(`- Route: ${ROUTE.join(" -> ")}`);
lines.push(`- Hang limit per step: ${HANG_LIMIT_MS / 1000}s`);
lines.push(`- **Overall: ${overallPass ? "PASS" : "FAIL"}**`);
lines.push("");
if (fatal) {
  lines.push(`> Fatal error: ${fatal}`);
  lines.push("");
}
lines.push("| Room | Reached | Description spoken | Slowest step | Within 10s | Result |");
lines.push("|---|---|---|---|---|---|");
for (const r of results) {
  lines.push(
    `| ${r.room} | ${r.reached ? "yes" : "no"} | ${r.descriptionSpoken ? "yes" : "no"} ` +
    `| ${(r.slowestStepMs / 1000).toFixed(2)}s | ${r.hang ? "NO" : "yes"} | ${r.pass ? "PASS" : "FAIL"} |`,
  );
}
lines.push("");
lines.push("## Per-room detail");
for (const r of results) {
  lines.push("");
  lines.push(`### Room ${r.room} — ${r.pass ? "PASS" : "FAIL"}`);
  if (r.error) lines.push(`- Error: ${r.error}`);
  lines.push(`- Description spoken: ${r.descriptionSpoken ? "yes" : "no"}`);
  if (r.descriptionPreview) lines.push(`- Announced hotspots: ${r.descriptionPreview}`);
  lines.push(`- Slowest step: ${(r.slowestStepMs / 1000).toFixed(2)}s (limit ${HANG_LIMIT_MS / 1000}s)`);
  if (r.steps.length) {
    lines.push(`- Steps:`);
    for (const s of r.steps) lines.push(`  - walk ${s.walk}: ${(s.ms / 1000).toFixed(2)}s`);
  }
}
lines.push("");
lines.push("## Live site");
lines.push("");
lines.push(`- Target: https://ghostlight.kashifnazir.com/?speechlog`);
lines.push(`- **Live: ${live.overall}**`);
lines.push("");
lines.push("| Step | Result | Time | Note |");
lines.push("|---|---|---|---|");
for (const s of live.rows) {
  lines.push(
    `| ${s.step} | ${s.pass ? "PASS" : "FAIL"} | ${(s.ms / 1000).toFixed(2)}s | ${String(s.note || "").replace(/\|/g, "\\|")} |`,
  );
}
if (stderrLines.length) {
  lines.push("");
  lines.push("## Server log (stderr tail)");
  lines.push("```");
  lines.push(stderrLines.slice(-20).join("\n"));
  lines.push("```");
}
lines.push("");

const reportRel = join("reports", `nightly-${date}.md`);
const reportAbs = join(REPO, reportRel);
mkdirSync(dirname(reportAbs), { recursive: true });
writeFileSync(reportAbs, lines.join("\n"));

// --- commit that one file (no push) -------------------------------------------
function git(...args) {
  return execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8" });
}
git("add", reportRel);
try {
  git("commit", "-m", `nightly: rooms 9-3-5 ${date}`, "--", reportRel);
} catch (e) {
  // A no-op commit (file unchanged since last run) is not a failure to report.
  const msg = (e.stdout || "") + (e.stderr || "");
  if (!/nothing to commit|no changes added/i.test(msg)) throw e;
}

console.log(`Report: ${reportAbs}`);
console.log(`Overall: ${overallPass ? "PASS" : "FAIL"} (rooms=${roomsPass ? "PASS" : "FAIL"}, live=${live.overall})`);
for (const r of results) {
  console.log(
    `  room ${r.room}: ${r.pass ? "PASS" : "FAIL"} ` +
    `(spoken=${r.descriptionSpoken ? "yes" : "no"}, slowest=${(r.slowestStepMs / 1000).toFixed(2)}s)`,
  );
}
for (const s of live.rows) {
  console.log(`  live ${s.step}: ${s.pass ? "PASS" : "FAIL"} (${(s.ms / 1000).toFixed(2)}s)`);
}
if (fatal) console.log(`  FATAL: ${fatal}`);
process.exit(fatal ? 1 : 0);
