# Crew box setup

`scripts/vm-setup.sh` rebuilds the box that runs the Ghostlight Survey Crew nightly. It reproduces the `ghostlight-crew` GCP VM as set up on 11 Nov 2026 (Ubuntu 24.04, e2-standard-2), and it's the route for moving the crew to an always-on Steam Machine before the Google credits run out in January.

## Run it

As the crew user (not root):

```sh
# copy scripts/vm-setup.sh to the box first (the repo is private, so it can't be fetched without the token)
bash vm-setup.sh
```

It's safe to rerun. Each step checks first and prints `already done` when there's nothing to do. The first run stops short of cloning until a GitHub token is stored, so the usual pattern is: run, do the checklist, run again.

## What it does, in order

1. apt packages, including `libvorbis-dev` and `libogg-dev`. Without Vorbis, ScummVM opens a "CD audio tracks" dialog that blocks the a11y layer and the nightly hangs.
2. Node 22 from the NodeSource apt repo.
3. kiro-cli from `cli.kiro.dev/install`.
4. Kiro Crew pinned to 0.12.0.
5. `git config --global credential.helper store`.
6. Clones `ghostlight` and `ghostlight-crew` side by side in `$HOME`, and sets a repo-local commit identity for the crew repo.
7. `npm ci` in ghostlight, Google Chrome through Playwright (for the live-site check), `scripts/fetch.sh` (ScummVM's official freeware downloads, checksum-verified), then the native engine build.
8. `~/bin/ghostlight-nightly.sh`: runs the room survey and the live check under `xvfb-run` with `SDL_AUDIODRIVER=dummy`.
9. A user systemd timer, `ghostlight-pull`, that pulls ghostlight at 01:50 London. It sits outside Crew because Crew's sandbox hides `~/.git-credentials` from jobs, which also means the token never enters the agent sandbox.
10. `loginctl enable-linger`, so user units and Crew runtimes keep running with nobody logged in.
11. `kirocrew service install` (systemd unit plus the AppArmor profile Ubuntu needs).
12. The nightly as a zero-token Crew command job, `surveyor-nightly-rooms`, at 02:00 Europe/London. It's only added if a job with that name doesn't exist yet.

Reports are committed on the box only. The token is read-only, so nothing is pushed.

## By hand (the script prints this as a checklist)

- **GitHub token.** A fine-grained PAT for the two repos with Contents: Read-only. Kash creates it and pastes it into `~/.git-credentials` himself. The script never reads or prints it.
- **`kiro-cli login`** with Builder ID.
- **`.saves/`** copied into `~/ghostlight-crew/.saves`. It's game state, gitignored, never committed.
- **Discord.** Connected from the Crew dashboard (`kirocrew token`, through an SSH tunnel to port 5476), then the nightly job adopted to that Discord session.
- **Test fire** with `kirocrew cron trigger <id>`, and pause the job on whichever machine ran it before.

## SteamOS (untested)

SteamOS has a read-only root, so apt can't run on the host. The plan is to run all of this inside a Distrobox container:

```sh
distrobox create --name crew --image ubuntu:24.04
distrobox enter crew -- bash ~/vm-setup.sh
```

The home directory is shared with the host, so the repos, `~/bin` and `~/.kiro` end up in the normal place. What's different:

- **systemd inside the container.** A plain Distrobox has no systemd of its own, so steps 9 to 11 (the user timer, linger and `kirocrew service install`) won't work in there. Run those from the host instead. Add host user units whose `ExecStart` is `distrobox enter crew -- <command>`: one for `kirocrew gateway` (long-running, `Restart=on-failure`) and the timer for the 01:50 pull. Turn on linger on the host with `loginctl enable-linger`. The other choice is `distrobox create --init`, which gives the container its own systemd.
- **AppArmor.** SteamOS doesn't ship Ubuntu's unprivileged-userns restriction, so Crew's AppArmor step may not be needed. Check with `kirocrew doctor`.
- **Always on.** No instance schedule is needed. The box stays up and the 02:00 job just runs.

## Night jobs on the VM (11 Nov)

| London time | Job | Kind | Posts to |
|---|---|---|---|
| 01:50 | `ghostlight-pull` user timer | systemd, outside Crew | nothing |
| 02:00 | `surveyor-nightly-rooms` | Crew script job (`scripts/crew/ghostlight_post.py` runs `~/bin/ghostlight-nightly.sh`) | Discord night-jobs thread |
| 03:00 | `ch4-drafts` | Crew agent job, prompt in `~/ch4-drafts-prompt.txt`, writes only `drafts/ch4/draft-4.json` and `drafts/ch4/flags.md` (`~/.kiro/settings/permissions.yaml`) | the thread, as the agent's reply |
| 05:45 | `ch4-drafts-commit` | Crew script job running `~/bin/ch4-drafts-commit.sh` (local commit, no push) | the thread |
| 06:15 and 06:50 | `ghostlight-crew-push` user timer | systemd, outside Crew (the token is hidden from Crew jobs) | GitHub: `git pull --rebase` then `git push` of ghostlight-crew. Needs the token's Contents: Read and write |
| 06:00 | `ch4-review` | Crew script job (`scripts/crew/ch4_review.py`, zero-token itself) hands one review card per newly drafted, undecided chapter 4 room to the night-jobs thread's chat session; its agent posts the card (about 0.1 to 0.3 credits each, measured 12 Nov). Kash replies in the thread with Approve room N, Change room N and what to change, or Reject room N, and the agent records it in `drafts/ch4/decisions.json` (the third file in `permissions.yaml`'s allow list) or edits that room in `draft-4.json`. Replies to a cron-started turn reach Discord as plain text, so Crew's option buttons show only as a numbered list: hence typed replies | the thread |
| 06:45 | `ch4-review-commit` | Crew script job via `ghostlight_post.py` running `~/bin/ch4-review-commit.sh` (`scripts/crew/ch4-review-commit.sh`): commits `decisions.json` and `draft-4.json` locally, no push | the thread |

The chapter drafting jobs and the `drascula-live` MCP wrapper (`~/bin/drascula-mcp.sh`, registered in `~/.kiro/crew/mcp.json`) are set up by hand; `vm-setup.sh` doesn't create them yet. Crew command jobs (`--command`) never post to Discord, which is why the night jobs go through the poster script.

## Listener (Mac)

| When | Job | Kind | Result |
|---|---|---|---|
| After each deploy, by hand | `listener` on the Mac's Crew (trigger-only: its cron `0 0 31 2 *` never fires), run with `kirocrew cron trigger <id>` | Zero-token command job running `scripts/listener-request.sh` | `reports/listener-<date>-<HHMM>.md`, committed locally; the Crew dashboard on the Mac shows the summary. No Discord: the bot token is connected to the VM's gateway |

Why the split: inside the Mac Crew job sandbox `prlctl` fails ("Failed to initialize Parallels Desktop in unattended mode", `/bin/ps: Operation not permitted`), so the job can't drive the Windows VM itself. `listener-request.sh` drops a file in `~/.ghostlight-listener/queue`; a launchd user agent (`com.ghostlight.listener`, QueueDirectories) runs `scripts/listener.sh --from-queue` outside Crew and writes `~/.ghostlight-listener/done-<id>`, which the job prints. The agent needs Kash's OK to install (it's a persistent launchd job). Until then, run `scripts/listener.sh` by hand after a deploy.


The review window is 06:00 to 07:00 London, while the VM is up. A reply sent after 07:00 reaches a bot that's offline; whether Crew picks it up when the VM starts again at 01:00 is untested.
