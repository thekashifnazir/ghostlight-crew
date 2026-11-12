// whole-game.mjs: nightly "the whole game is still completable" check.
//
// Replays data/playthrough-route.txt (the route that first played Drascula from
// a fresh start to the final ending on 12 Nov 2026) through the drascula-live
// MCP server on the native engine, then writes reports/whole-game-<date>.md and
// commits that one file (no push). Zero Kiro credits: no agent is involved.
//
// Rules:
//   - A command that times out on 10 s of engine silence is a SOFT warning: the
//     engine is usually fine afterwards (long cutscenes, chapter crossings). The
//     script then polls `state` until the engine answers, and carries on.
//   - `save N # chN start ...` lines are chapter checkpoints: before saving, the
//     current chapter must be N.
//   - The final `use 9 56` must return `ended: true`.
//   - PASS = every chapter 1 to 6 reached at its checkpoint, the game ended, and
//     no hard failures.
// Saves go to a fresh scratch savepath (never the repo's .saves).
//
// Usage:  node scripts/whole-game.mjs     (on the VM, under xvfb-run with
//         SDL_AUDIODRIVER=dummy, see ~/bin/ghostlight-whole-game.sh)

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
const SAVES = mkdtempSync(join(tmpdir(), "whole-game-saves-"));
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
const isTimeout = (j) => /did not settle|busy-skip|busy/i.test(String(j && j.error || ""));

// After a soft timeout, poll `state` until the engine answers with anything that
// isn't another silence timeout (a refusal during a conversation counts as alive).
async function waitSettled() {
  const t0 = Date.now();
  while (Date.now() - t0 < SETTLE_MAX_MS) {
    const s = await tool("state");
    if (!isTimeout(s)) return { ok: true, ms: Date.now() - t0, state: s };
    await new Promise((r) => setTimeout(r, SETTLE_POLL_MS));
  }
  return { ok: false, ms: Date.now() - t0 };
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

// --- replay -------------------------------------------------------------------
const t0 = Date.now();
const counts = { ok: 0, soft: 0, failed: 0 };
const chapters = {};          // N -> { reached: bool, saw: chapter }
const problems = [];          // { line, cmd, kind, note }
let ended = false, fatal = null;

try {
  const init = await rpc("initialize", {
    protocolVersion: "2024-11-05", capabilities: {},
    clientInfo: { name: "whole-game", version: "1" },
  });
  if (init.error) throw new Error(`MCP server failed to start: ${init.error.message}`);
  srv.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

  for (const step of route) {
    const cmd = `${step.verb} ${step.args.join(" ")}`.trim();
    if (step.checkpoint) {
      const s = await tool("state");
      const saw = s && s.chapter;
      chapters[step.checkpoint] = { reached: saw === step.checkpoint, saw };
      if (saw !== step.checkpoint) {
        problems.push({ line: step.line, cmd, kind: "chapter", note: `expected chapter ${step.checkpoint}, state says ${saw ?? JSON.stringify(s.error || s).slice(0, 120)}` });
      }
    }
    const j = await tool(step.verb, argsFor(step.verb, step.args));
    if (j && j.ended) ended = true;
    if (isTimeout(j)) {
      counts.soft++;
      const w = await waitSettled();
      problems.push({ line: step.line, cmd, kind: "soft", note: w.ok ? `silence timeout; engine answered after ${(w.ms / 1000).toFixed(0)} s` : "silence timeout; engine never answered" });
      if (!w.ok) throw new Error(`engine stopped answering after line ${step.line} (${cmd})`);
      if (w.state && /game has ended/i.test(String(w.state.error || ""))) ended = true;
    } else if (j && j.error && !j.ended) {
      counts.failed++;
      problems.push({ line: step.line, cmd, kind: "failed", note: String(j.error).slice(0, 200) });
    } else {
      counts.ok++;
    }
  }
  // The ending may land after the final command timed out: ask once more.
  if (!ended) {
    const s = await tool("state");
    if (/game has ended/i.test(String(s.error || ""))) ended = true;
  }
  await tool("stop");
} catch (e) {
  fatal = e.message || String(e);
} finally {
  try { srv.kill(); } catch {}
  try { rmSync(SAVES, { recursive: true, force: true }); } catch {}
}

// --- report -------------------------------------------------------------------
const minutes = (Date.now() - t0) / 60000;
const reached = [1, 2, 3, 4, 5, 6].filter((n) => chapters[n] && chapters[n].reached);
const pass = !fatal && reached.length === 6 && ended && counts.failed === 0;
const date = new Date().toISOString().slice(0, 10);

const lines = [
  `# Whole-game check: ${date}`,
  "",
  `- Run (UTC): ${new Date(t0).toISOString()}`,
  `- Route: data/playthrough-route.txt (${route.length} lines)`,
  `- **Overall: ${pass ? "PASS" : "FAIL"}**`,
  `- Chapters reached at their checkpoints: ${reached.length ? reached.join(", ") : "none"} of 1 to 6`,
  `- Game ended (final \`use 9 56\`): ${ended ? "yes" : "no"}`,
  `- Commands: ${counts.ok} ok, ${counts.soft} soft timeouts (engine fine after), ${counts.failed} failed`,
  `- Time: ${minutes.toFixed(1)} min`,
  "",
];
if (fatal) lines.push(`> Fatal: ${fatal}`, "");
if (problems.length) {
  lines.push("| Line | Command | Kind | Note |", "|---|---|---|---|");
  for (const p of problems) lines.push(`| ${p.line} | \`${p.cmd}\` | ${p.kind} | ${p.note.replace(/\|/g, "\\|")} |`);
  lines.push("");
}
const reportRel = join("reports", `whole-game-${date}.md`);
const reportAbs = join(REPO, reportRel);
mkdirSync(dirname(reportAbs), { recursive: true });
writeFileSync(reportAbs, lines.join("\n"));

function git(...args) {
  return execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8" });
}
try {
  git("add", reportRel);
  git("commit", "-m", `whole-game: ${pass ? "PASS" : "FAIL"} ${date}`, "--", reportRel);
} catch (e) {
  const msg = (e.stdout || "") + (e.stderr || "");
  if (!/nothing to commit|no changes added/i.test(msg)) console.error(`commit failed: ${msg.trim()}`);
}

console.log(`Whole game: ${pass ? "PASS" : "FAIL"}`);
console.log(`Chapters reached: ${reached.join(", ") || "none"} of 1 to 6; ended: ${ended ? "yes" : "no"}`);
console.log(`Commands: ${counts.ok} ok, ${counts.soft} soft timeouts, ${counts.failed} failed; ${minutes.toFixed(1)} min`);
if (fatal) console.log(`Fatal: ${fatal}`);
console.log(`Report: ${reportRel}`);
process.exit(0);
