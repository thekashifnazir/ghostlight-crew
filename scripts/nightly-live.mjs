// nightly-live.mjs — nightly live-site smoke check of the deployed Ghostlight.
//
// Drives the real browser build at https://ghostlight.kashifnazir.com/?speechlog
// with Chrome (Playwright, channel 'chrome', headless) and plays the opening of
// the game the way a screen-reader player would: start, list hotspots, talk to
// the bartender, dismiss the drunk, cross into Chapter 2, then save + reload.
//
// It never uses fixed sleeps. The page exposes a readiness signal the check
// polls instead:
//
//   window.__ghostlight = {
//     phase:    'gate' | 'ready' | 'busy' | 'conversation' | 'choice' | 'error',
//     lines:    [{ seq, t, text }, ...],   // everything spoken, in order
//     lastLine: '...'                      // most recent spoken line's text, "" before any
//   }
//
// Playwright is borrowed from the engine repo (no dependency added here):
//   ../../ghostlight/node_modules/playwright/index.mjs (the sibling ghostlight checkout, so it works on the Mac and the VM)
//
// Exports: async function liveCheck() -> { rows, overall }. It never throws;
// any failure becomes a FAIL row and a non-PASS overall.

import { chromium } from "../../ghostlight/node_modules/playwright/index.mjs";

const URL = "https://ghostlight.kashifnazir.com/?speechlog&noguide";

// Read the whole signal out of the page in one hop.
const readSig = (page) =>
  page.evaluate(() => {
    const g = window.__ghostlight || {};
    return {
      phase: g.phase || null,
      lines: Array.isArray(g.lines) ? g.lines : [],
      lastLine: typeof g.lastLine === "string" ? g.lastLine : "",
    };
  });

// Poll the signal until `pred(sig)` is true or `capMs` elapses. Resolves to the
// last signal seen; the caller decides pass/fail from it (never throws).
async function waitFor(page, pred, capMs) {
  const t0 = Date.now();
  let sig = await readSig(page);
  while (!pred(sig)) {
    if (Date.now() - t0 > capMs) return { sig, timedOut: true };
    await page.waitForTimeout(250);
    sig = await readSig(page);
  }
  return { sig, timedOut: false };
}

const anyLine = (sig, re) => sig.lines.some((l) => re.test(l.text || ""));
const lastText = (sig) => sig.lastLine || "";

// Poll a DOM predicate (evaluated in the page) until it returns true or `capMs`
// elapses. Resolves to true if the predicate held, false on timeout. Never
// throws — used to wait for the resume Continue button to exist and be focused.
async function waitForButton(page, pred, capMs) {
  const t0 = Date.now();
  while (true) {
    let ok = false;
    try {
      ok = await page.evaluate(pred);
    } catch {
      ok = false;
    }
    if (ok) return true;
    if (Date.now() - t0 > capMs) return false;
    await page.waitForTimeout(250);
  }
}

// Press ArrowRight until lastLine matches `re` (cycling the hotspot list), or
// give up after `maxPresses`. Returns the final signal.
async function arrowUntil(page, re, maxPresses = 40) {
  let sig = await readSig(page);
  for (let i = 0; i < maxPresses && !re.test(lastText(sig)); i++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(150);
    sig = await readSig(page);
  }
  return sig;
}

export async function liveCheck() {
  const rows = [];
  const row = (step, pass, ms, note) =>
    rows.push({ step, pass: !!pass, ms: Math.round(ms), note: note || "" });

  let browser = null;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded" });

    // (a) start: wait for the start button, press Enter, reach 'ready' in the
    //     inn bar. 90s cap covers first-load engine boot.
    {
      const t0 = Date.now();
      let note = "";
      let pass = false;
      try {
        await page.waitForSelector("#start-button", { timeout: 90_000 });
        await page.keyboard.press("Enter");
        const { sig, timedOut } = await waitFor(
          page,
          (s) => s.phase === "ready" && anyLine(s, /Inn bar/i),
          90_000,
        );
        pass = !timedOut;
        note = timedOut ? `timeout (phase=${sig.phase})` : "reached inn bar";
      } catch (e) {
        note = `error: ${e.message || e}`;
      }
      row("start", pass, Date.now() - t0, note);
    }

    // (a2) nudge: the first room reads "Worth a look" straight after the room
    //      name, and no longer ends with the old list of keys (14 Nov changes).
    {
      const sig = await readSig(page);
      const first = (sig.lines.find((l) => /Inn bar/i.test(l.text || "")) || {}).text || "";
      const pass = /^Inn bar\. Worth a look: /.test(first) && !/Now, how to play/.test(first);
      row("nudge", pass, 0, pass ? "nudge after the room name" : `first=${first.slice(0, 120)}`);
    }

    // (b) list: ArrowRight through hotspots until the bartender entry reads as
    //     "<name>, N of M" (the list announces position).
    {
      const t0 = Date.now();
      const sig = await arrowUntil(page, /bartender[^,]*, \d+ of/i);
      const pass = /bartender[^,]*, \d+ of/i.test(lastText(sig));
      row("list", pass, Date.now() - t0, pass ? lastText(sig) : `last=${lastText(sig)}`);
    }

    // (c) talk: Enter to converse with the bartender, wait for the conversation
    //     to finish (back to 'ready', not 'conversation'/'busy'), then assert no
    //     spoken line repeats — a duplicate burst is the regression we watch for.
    {
      const t0 = Date.now();
      let note = "";
      let pass = false;
      const before = (await readSig(page)).lines.length;
      await page.keyboard.press("Enter");
      const { sig, timedOut } = await waitFor(
        page,
        (s) => s.phase === "ready",
        240_000,
      );
      if (timedOut) {
        note = `timeout (phase=${sig.phase})`;
      } else {
        const convo = sig.lines.slice(before).map((l) => l.text || "");
        const seen = new Set();
        const dup = convo.find((t) => (seen.has(t) ? true : (seen.add(t), false)));
        pass = !dup;
        note = dup ? `duplicate line: ${String(dup).slice(0, 60)}` : `${convo.length} lines, no dupes`;
      }
      row("talk", pass, Date.now() - t0, note);
    }

    // (d) choice: ArrowRight to the drunk, Enter to talk. The drunk's lead-in
    //     lines play first, so wait up to 240s for the 'choice' phase (the
    //     dialogue menu), pick option 4 (goodbye), and return to 'ready'.
    {
      const t0 = Date.now();
      let note = "";
      let pass = false;
      await arrowUntil(page, /drunk/i);
      const atDrunk = /drunk/i.test(lastText(await readSig(page)));
      await page.keyboard.press("Enter");
      const choice = await waitFor(page, (s) => s.phase === "choice", 240_000);
      if (choice.timedOut) {
        note = `no choice menu (phase=${choice.sig.phase})`;
      } else {
        await page.keyboard.press("4");
        const back = await waitFor(page, (s) => s.phase === "ready", 240_000);
        pass = atDrunk && !back.timedOut;
        note = back.timedOut ? `stuck (phase=${back.sig.phase})` : "goodbye -> ready";
      }
      row("choice", pass, Date.now() - t0, note);
    }

    // (e) crossing: ArrowRight to the curtain, Enter to cross, wait for the
    //     'Chapter 2' line (180s). Assert at least one line was spoken between
    //     the walk and 'Chapter 2' so the ending story is not skipped.
    {
      const t0 = Date.now();
      let note = "";
      let pass = false;
      await arrowUntil(page, /curtain/i);
      const before = (await readSig(page)).lines.length;
      await page.keyboard.press("Enter");
      const { sig, timedOut } = await waitFor(
        page,
        (s) => anyLine(s, /Chapter 2/i),
        180_000,
      );
      if (timedOut) {
        note = `no 'Chapter 2' (phase=${sig.phase})`;
      } else {
        // index of the first 'Chapter 2' line within the slice after the walk
        const after = sig.lines.slice(before);
        const chIdx = after.findIndex((l) => /Chapter 2/i.test(l.text || ""));
        const between = chIdx > 0; // at least one line before 'Chapter 2'
        pass = between;
        note = between ? `${chIdx} line(s) before Chapter 2` : "ending story skipped";
      }
      row("crossing", pass, Date.now() - t0, note);
    }

    // (f) save/load: press 'c' to save (wait 'Saved.'), reload the page, Enter on
    //     Continue, wait for 'Loaded:' confirming the slot restored.
    {
      const t0 = Date.now();
      let note = "";
      let pass = false;
      await page.keyboard.press("c");
      const saved = await waitFor(page, (s) => anyLine(s, /Saved\./i), 90_000);
      if (saved.timedOut) {
        note = `no 'Saved.' (phase=${saved.sig.phase})`;
      } else {
        await page.reload({ waitUntil: "domcontentloaded" });
        // After reload the resume choice is a #continue-button. Press Enter only
        // once it exists AND holds focus (document.activeElement) — pressing
        // before the button is ready was the cause of the 'no Loaded:' failure.
        const ready = await waitForButton(
          page,
          () =>
            !!document.querySelector("#continue-button") &&
            document.querySelector("#continue-button") === document.activeElement,
          30_000,
        );
        if (!ready) {
          note = "no Continue offered";
        } else {
          await page.keyboard.press("Enter");
          const loaded = await waitFor(page, (s) => anyLine(s, /Loaded:/i), 90_000);
          pass = !loaded.timedOut;
          note = loaded.timedOut ? `no 'Loaded:' (phase=${loaded.sig.phase})` : "saved + loaded";
        }
      }
      row("save/load", pass, Date.now() - t0, note);
    }

    // (g) guide: a fresh visitor (no ?noguide, empty storage) is offered the
    //     How to play guide, focused, and its first page opens on the heading.
    {
      const t0 = Date.now();
      let pass = false;
      let note = "";
      const ctx = await browser.newContext();
      try {
        const g = await ctx.newPage();
        await g.goto(URL.replace(/[?&]noguide/, "").replace(/\?$/, ""), { waitUntil: "domcontentloaded" });
        await g.waitForSelector("#guide-start", { timeout: 60_000 });
        const focused = await g.evaluate(() => document.activeElement?.id);
        await g.keyboard.press("Enter");
        await g.waitForSelector("#guide-title", { timeout: 10_000 });
        const title = await g.textContent("#guide-title");
        pass = focused === "guide-start" && /page 1 of 5/.test(title || "");
        note = pass ? `offered; ${title}` : `focused=${focused} title=${title}`;
      } catch (e) {
        note = `error: ${e.message || e}`;
      } finally {
        await ctx.close().catch(() => {});
      }
      row("guide", pass, Date.now() - t0, note);
    }
  } catch (e) {
    // Anything unexpected (launch failure, navigation error) is one FAIL row so
    // the report still renders and overall is non-PASS.
    row("live", false, 0, `fatal: ${e.message || e}`);
  } finally {
    try { if (browser) await browser.close(); } catch {}
  }

  const overall = rows.length > 0 && rows.every((r) => r.pass) ? "PASS" : "FAIL";
  return { rows, overall };
}
