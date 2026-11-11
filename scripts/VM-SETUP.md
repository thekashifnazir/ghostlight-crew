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
