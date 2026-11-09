# Uninformed playtest, run 1 (9 Nov 2026, ~00:40-01:05)

Run by Claude Code as a stand-in for the Crew "newcomer" bot (its browser tool needed a setting change; see the Kiroween crew-how-it-works notes). A fresh agent with no source, pack or solutions played the deployed build through an ears-only bridge (one key at a time, only the spoken lines back). Bridge: scratch `bridge.mjs`; key log replayed to reproduce the dead state.

---

# Playtest report, run 1 (blind first-time player, ears service only)

## 1. Outcome

- I finished chapter 1. I heard "Chapter 2: The village" after I took the room key from the bartender and went through the curtained doorway.
- In chapter 2 I found B.J.'s handbag in the trunk, got money and two coins out of it, fed the coins to the cigarette machine in the back room, pushed it and got cigarettes. I talked to the drunk and learned about Uncle Desiderio and Von Braun.
- I didn't get Von Braun's hut onto the valley map. I picked option 3 ("AND WHERE CAN I FIND VON BRAUN?") and heard nothing. After that, talking to anyone was silent. I pressed O (load), and from then on every interaction gave errors like "object 171 is not in this room" and "object 53 is not in this room or inventory". I ended there, stuck in the inn bar.
- Characters I talked to: bartender, drunk (twice), pianist. I never left the inn.
- Presses used: about 141 (130 key presses plus 11 typed commands). The server counter ended at 132, but it doesn't count /type calls, and the restart showed as 2.

## 2. Timeline

- restart -> "Ghostlight makes Drascula playable with the keyboard... Press F1 at any time..."
- F1 -> started the game instead of opening help: "Inn bar A stone tavern with a wooden floor..." (long room description plus a short controls summary)
- F1 -> "Controls. Left and Right cycle the things, people and exits..." (very long, about 25 sentences)
- h -> "It's late, and you'll need somewhere to sleep."
- Right x4 -> bin 2 of 10, menu board, burger poster, bartender 5 of 10
- Enter (bartender) -> "YOU, BARTENDER...!!" ... "ROOM 512. UPSTAIRS. THE KEY IS UNDER THE DOOR" ... "COUNT DRASCULA!!?"
- Enter x3 -> the conversation went on ("SO?", "SOME SAY HE IS A VAMPIRE...", "I'M JOHN HACKER...")
- Enter -> "I THINK I'M GOING BACK TO MY MUM'S..." then the WHOLE conversation again from the start, then "IT'D BE BETTER NOT" x4
- h -> "You've got a room. Time for bed."
- Right -> drunk 6 of 10; Enter -> "Choices, 4 options." (the options weren't read)
- r -> "1. HI BOSS, HOW ARE YOU? 2. AND HOW IS THE FAMILY? 3. ... 4. I'D BETTER NOT SAY ANYTHING."
- 1, 2, 3 -> each line said twice ("HI BOSS..." "I'M HERE, DRINKING" "Choices, 4 options." "HI BOSS..." "I'M HERE, DRINKING")
- 4 -> "I'D BETTER NOT SAY ANYTHING."
- Right, Right -> curtained doorway 7 of 10, pianist 8 of 10
- Enter (pianist) -> "YOU...PIANIST...!!!!" "BEAUTIFUL NIGHT" ... "WELL THEN" (8 lines)
- Right x3, Left -> stone arch, skull 10 of 10, stairs 1 of 10 (it wraps), skull
- Down (skull) -> "A skull sitting on top of the piano." "THAT'S A NICE SKULL..."
- Left x3 -> back to the curtained doorway
- Enter -> "Chapter 2: The village. Inn bar The inn's tavern again..." (no word about going to bed or what happened overnight)
- h -> "B.J. was staying in your room. Did she leave anything behind?" (I'd never heard of B.J.)
- Shift%2BR, Shift+R, Shift%2BKeyR, r -> silence, or an "Unknown key" error from the ears service
- Right -> bin 2 of 12
- Slash -> "Command. Type what to do, for example talk to drunk..."; typed "go to guest rooms", Enter -> "Guest bedroom An attic bedroom..."
- Right, Down (bed) -> "An unmade bed with a red cover..." "THERE IS NOTHING SPECIAL ABOUT IT"
- Right x2, Enter (wardrobe) -> "IT'S TOO TOUGH FOR ME"
- Right, Enter (trunk) -> "WHY?"
- v -> "Actions for trunk."; Down -> silence; r -> silence; Escape -> "Cancelled. Back to trunk."
- /open trunk -> "I'VE FOUND B.J.'S HANDBAG!" "Received B.J.'s handbag."
- h -> "You're carrying something of B.J.'s. Have a closer look at it."
- Tab -> "Inventory, 2 items."; Right -> silence; Down -> silence; Escape -> "Closed inventory."
- /look at handbag -> "THERE IS A ONE THOUSAND BILL AND A COUPLE OF COINS" "Received money." "Received two coins."
- h -> "The machine in the back room takes coins. It isn't very honest, though."
- /go to door -> back in the Inn bar (new things here: piano, small poster)
- /go to back room -> "Inn back room The small back room with the long table..."
- /use coins on vending machine -> "THIS IS A TRICK! NOTHING CAME OUT!" "Received one coin." "You no longer have the two coins."
- h -> "Feed the cigarette machine your coins. When nothing comes out, don't take it lying down."
- /push vending machine -> "AT LAST!" "Received cigarettes."
- h -> "Somebody in the bar knows more about this village than he lets on."
- /go to bar -> Inn bar
- /talk to drunk -> started mid-conversation: "SHE IS ATTRACTED TO UNCLE DESIDERIO" ... "HE WENT TO THE CASTLE AND NEVER CAME BACK"
- h -> the hint, then "Choices, 4 options.", then "HI" and the drunk's lines replayed
- r -> "1. but, what's the matter with that drascula 2. who is that guy NAMED VON BRAUN? 3. AND WHERE CAN I FIND VON BRAUN? 4. WELL. THANKS AND GOODBYE."
- 2 -> "who is that guy NAMED VON BRAUN?" ... "Von Braun started to research all he could find on vampires."
- Enter -> "When he thought he was ready, he went up to the castle..." "...Drascula could not kill him."
- Enter -> silence; r -> the 4 options again
- 3 -> silence; r -> silence
- h -> "Talk to the drunk, then choose AND WHERE CAN I FIND VON BRAUN? His hut then appears on the valley map."
- l -> Inn bar description
- /talk to drunk -> silence; r -> silence; Escape -> silence; h -> the same hint as before
- Right x5 to drunk, Enter -> silence; 3 -> silence; Down -> "An old man in a brown jacket at the end of the bar."
- h -> the same hint; Up -> silence; v -> "Actions for drunk."; Right, 3, Enter -> silence
- Escape -> silence; l -> Inn bar
- /go to street -> silence; l -> still the Inn bar
- Left -> bartender 5 of 12; Enter -> silence; Backspace -> "bartender, 5 of 12"; Down -> "A big bald man in a vest..."
- o (load) -> silence; l -> Inn bar; Space -> silence; Enter -> silence
- s -> "12 things, left to right: 3 people, 6 objects, 3 exits."
- Left x4 -> skull 12 of 12, small poster, piano, stone arch 9 of 12 (focus had gone back to the start without telling me)
- Enter (stone arch) -> "object 171 is not in this room"
- Escape -> "Nothing happened."; Enter -> "object 171 is not in this room"
- h -> "Somebody in the bar knows more about this village than he lets on." (it had gone back to an earlier hint)
- Left x3 to drunk, Enter -> "object 53 is not in this room or inventory"

## 3. Stuck or confused moments

1. **F1 at the very start.** The opening said "press any key to begin" and "F1 at any time for controls", so I pressed F1 expecting help. It just started the game, and I had to press F1 again. That was a small surprise, but it cost a press.
2. **Pressing Enter through the bartender conversation.** I didn't know whether Enter moved the conversation on or started it again. After four Enters the whole conversation played again from the top, then "IT'D BE BETTER NOT" four times. I think my extra Enters were taken as new actions. Nothing told me when the conversation had finished. I expected a cue like "conversation over" or "press Enter to continue". I got out by moving on.
3. **The choice menu doesn't read its options.** It only says "Choices, 4 options." I had to remember from F1 that R reads them. I expected the first option, or all of them, to be read as soon as the menu opens.
4. **Chapter 1 ended with no story.** I went through the curtained doorway and immediately heard "Chapter 2: The village", back in the bar. Nothing about sleeping or what happened overnight, so I didn't know who B.J. was or why she'd been in my room. The next hint mentioned B.J. as if I should already know her. I tried R and Shift+R to hear what I'd missed and got silence.
5. **R and Shift+R often said nothing.** I couldn't work out how to send Shift+R through the service ("Shift+R" in the URL turned into "Shift R", and %2B came back empty). Plain R was silent several times. Maybe R only repeats a line when there's something new to repeat? If so, nothing told me that. I never managed to replay what I'd missed.
6. **Enter on the trunk said "WHY?"** It wasn't clear that Enter means "pick up" or "use" rather than "open". V said "Actions for trunk." but Down, Right and R in that menu were all silent, so I never heard the list of actions. I escaped and typed "open trunk" instead, which worked. After that I used the slash box for nearly everything.
7. **The inventory was silent.** Tab said "Inventory, 2 items." but Right and Down said nothing, so I never heard what I was carrying. I got around it by typing "look at handbag".
8. **The drunk conversation started in the middle.** "/talk to drunk" began at "SHE IS ATTRACTED TO UNCLE DESIDERIO". I missed his first line, and only heard "HI" later, replayed after the hint. Pressing H in the middle of the conversation mixed the hint into the drunk's lines.
9. **The big one, where I got stuck for good.** I chose option 3 in the drunk menu, "AND WHERE CAN I FIND VON BRAUN?", and heard nothing. After that, talking to the drunk or the bartender by arrow keys, Enter, Up, V or the slash box was silent. "/go to street" was silent too, and I stayed in the bar. Examine (Down), L and S still worked, so the room description was alive but the game itself wasn't answering. The hint kept telling me to do exactly what I thought I'd done. I tried Escape, Backspace, Space and O (load). O said nothing. After it, every interaction gave developer-style errors: "object 171 is not in this room" on the stone arch, and "object 53 is not in this room or inventory" on the drunk. The hint went back to an earlier one ("Somebody in the bar knows more..."). I never got out. The only way out would have been a restart, and that was outside what a player could do.
10. **Focus moved without telling me.** At some point (after L or O) focus went back to the first item. My next Left landed on "skull, 12 of 12" when I expected to be near the bartender.

## 4. Controls

**Discovered and used:**
- Left and Right through things (they wrap around), Enter to interact, Down to examine
- H for hints, which were very useful and nudged me well
- F1 for help, L to read the room, S to scan
- Slash command box ("open trunk", "go to back room", "use coins on vending machine", "push vending machine", "talk to drunk", "look at handbag"). This was the most reliable control by far.
- Number keys and R in choice menus, Escape to close menus, Tab to open the inventory

**Never found or never understood:**
- The V action menu: I never heard a single action in it.
- Moving through the inventory and choosing an item: always silent.
- Shift+R history: couldn't send it, or it was silent.
- R outside menus: mostly silent.
- O (load): silent, and it seemed to break the game.
- C (save): didn't try.
- N and P, M, G: didn't try for lack of budget. I didn't use the ghost voice.
- Up as interact: it was silent, but by then everything was.
- How to move a conversation on, and how to tell when one has finished.

## 5. Speech problems

- **Too long:** the F1 help is one huge block of about 25 sentences, and I'd forget the start before the end. The room description repeats the full "Here: ... Exits: ..." list every time I enter.
- **Repeated:** in the drunk's menu, every choice and its answer were said twice. The bartender conversation replayed in full, then "IT'D BE BETTER NOT" four times. A hint pressed mid-conversation replayed the drunk's lines.
- **Unclear:** "WHY?" on the trunk. "IT'S TOO TOUGH FOR ME" on the wardrobe (did I need a different verb?). "Received one coin." alongside "You no longer have the two coins." (so I have one coin now?). "Nothing happened." after Escape.
- **Developer messages:** "object 171 is not in this room" and "object 53 is not in this room or inventory" mean nothing to a player.
- **Missing:** the menu options aren't read on opening. The inventory items are silent. The V actions are silent. The chapter 1 ending cutscene had no words. Option 3 to the drunk got no reply. Load gave no confirmation.
- **Out of order:** the drunk conversation started mid-way, and its opening "HI" came later, after the hint.
- **All caps:** the game dialogue is in capitals, which some screen readers may spell out or shout. Mostly it was fine.

## 6. Top 5 suggestions (ranked)

1. **Fix the silent dead state after a dialogue choice, and the load that breaks things.** After option 3 to the drunk, nothing answered and I couldn't move on. O made it worse, with "object N is not in this room" errors. At the very least, always say something when the player acts ("The drunk is busy", "Loaded save from the inn bar"). Never speak internal object numbers.
2. **Read menus and lists out loud.** On opening a choice menu, read the options (or at least option 1). Say the item name on every arrow press in the inventory and the V action menu. Right now all three are effectively unusable by keyboard, and only the slash box saved me.
3. **Narrate cutscenes and chapter transitions,** for example a sentence on going to bed, meeting B.J. and what happened overnight. Also make R and Shift+R reliably replay the last few lines, so a missed scene can be recovered.
4. **Make conversation pacing clear.** Say when a conversation has finished. Stop extra Enters from restarting it or queueing "IT'D BE BETTER NOT" four times. Don't say the choice and its answer twice. Don't start a conversation mid-way, and don't let hint speech mix into dialogue.
5. **Shorten and layer the help.** Make F1 a short list (move, act, examine, slash, H, R, Tab) with "press F1 again for more". Don't let F1 start the game on the title screen. And since the slash box is the easiest way to play, say so plainly in the opening line.

## 7. Honesty check

- Everything I typed into the slash box came from what I heard: room names, object names, the example "talk to drunk", the verbs in F1 ("open, close, talk, push"), and the hints. "open trunk" came from F1 listing "open" as an action. "look at handbag" came from the hint "have a closer look at it". "push vending machine" came from the hint "don't take it lying down" plus F1 listing "push". That last one is a small inference, but a reasonable player could make it.
- "go to guest rooms", "go to door", "go to back room", "go to bar" and "go to street" were guesses at the command box's wording, built from exit names I'd heard. Nothing told me "go to" works. It's a common adventure-game phrase, so a real player could try it.
- I knew the Playwright key names (Shift+R, Slash) from the test instructions, not from the game. Trouble sending Shift+R was a harness issue, not a game issue.
- I used no outside knowledge of Drascula. I didn't know who B.J. or Von Braun were until the game told me.
