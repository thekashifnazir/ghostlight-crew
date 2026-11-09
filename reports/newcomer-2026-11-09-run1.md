# Crew "newcomer" bot playtest, run 1 (9 Nov 2026, ~01:30), with a correction

Run from Kash's phone in the Kiro Crew app. newcomer used Crew's built-in browser tool (Kiro's own Chromium, not Kash's Chrome), keyboard only, reading the accessibility snapshot.

## What newcomer reported

- After pressing Tab on the start screen, the game started and the Start button disappeared.
- Its accessibility snapshot then showed only the heading "Ghostlight" and the "Source code (GPL)" link: "no live region, no focusable controls". It concluded a blind player can't play.
- Its key tool rejected F1.

## Check (Claude Code, Chrome's own accessibility tree via CDP, same live build, 01:40)

```
main:
  - application "Ghostlight game"   (focused)
  - log: "bin, 2 of 10"
```

The live region (role=log) and the focused game element are in the tree and not ignored; NVDA (Windows VM) and VoiceOver (Mac) both spoke them on 8 Nov. The Crew browser tool's snapshot doesn't show the inside of `application` elements or live log text, so the bot saw nothing. Lesson: an automated tester only sees what its tool exposes; verify the tool before trusting its verdict.

## Real finding kept

Tab on the start screen started the game, so a screen reader user exploring with Tab is dropped in unexpectedly. Fixed by Kiro (only Enter, Space or a letter starts; Tab, arrows and modifiers don't), commit on ghostlight branch loop/it1.
