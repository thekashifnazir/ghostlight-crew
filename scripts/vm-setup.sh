#!/usr/bin/env bash
#
# vm-setup.sh: rebuild the Ghostlight Survey Crew box from scratch.
#
# Reproduces the ghostlight-crew GCP VM as set up on 11 Nov 2026 (Ubuntu 24.04),
# so the same box can be rebuilt anywhere, e.g. inside a Distrobox on a Steam
# Machine. Safe to rerun: every step checks before it acts.
#
# Usage (as the user who will own the crew, NOT root; sudo is used where needed):
#   bash vm-setup.sh
#
# Human steps (token paste, kiro-cli login, saves copy, Discord) are NOT
# automated. They are printed as a checklist at the end. See scripts/VM-SETUP.md.
#
# Game data is never committed and only ever comes from ghostlight's own
# scripts/fetch.sh (ScummVM's official freeware downloads, checksum-verified).
#
set -euo pipefail

GH_OWNER="thekashifnazir"
GHOSTLIGHT_DIR="$HOME/ghostlight"
CREW_DIR="$HOME/ghostlight-crew"
KIROCREW_VERSION="0.12.0"
NODE_MAJOR="22"
CRON_NAME="surveyor-nightly-rooms"
CRON_EXPR="0 2 * * *"
CRON_TZ="Europe/London"
PULL_TIME="01:50:00"

export PATH="$HOME/.local/bin:$PATH"

log()  { printf '\n[setup] %s\n' "$*"; }
skip() { printf '[setup]   already done: %s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }

[ "$(id -u)" -ne 0 ] || { echo "Run as the crew user, not root." >&2; exit 1; }

# --- 1. apt packages ----------------------------------------------------------
# libvorbis-dev and libogg-dev are REQUIRED: without Vorbis, ScummVM opens a
# modal "CD audio tracks" dialog that blocks the a11y layer and the nightly hangs.
APT_PKGS=(build-essential libsdl2-dev libpng-dev zlib1g-dev libvorbis-dev libogg-dev
          python3-venv tmux xvfb x11-apps imagemagick git curl ca-certificates gnupg)
log "1. apt packages"
missing=()
for p in "${APT_PKGS[@]}"; do
  dpkg -s "$p" >/dev/null 2>&1 || missing+=("$p")
done
if [ "${#missing[@]}" -gt 0 ]; then
  sudo apt-get update -q
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -q "${missing[@]}"
else
  skip "all ${#APT_PKGS[@]} packages"
fi

# --- 2. Node 22 (NodeSource apt repo, as on the VM) --------------------------
log "2. Node ${NODE_MAJOR}"
if have node && node --version | grep -q "^v${NODE_MAJOR}\."; then
  skip "node $(node --version)"
else
  sudo install -d -m 0755 /usr/share/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | sudo gpg --dearmor --yes -o /usr/share/keyrings/nodesource.gpg
  sudo tee /etc/apt/sources.list.d/nodesource.sources >/dev/null <<EOF
Types: deb
URIs: https://deb.nodesource.com/node_${NODE_MAJOR}.x
Suites: nodistro
Components: main
Signed-By: /usr/share/keyrings/nodesource.gpg
EOF
  sudo apt-get update -q
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -q nodejs
fi

# --- 3. kiro-cli ---------------------------------------------------------------
log "3. kiro-cli"
if have kiro-cli; then
  skip "$(kiro-cli --version 2>/dev/null | head -1)"
else
  curl -fsSL https://cli.kiro.dev/install | bash
fi

# --- 4. Kiro Crew, pinned ------------------------------------------------------
log "4. Kiro Crew ${KIROCREW_VERSION}"
if have kirocrew && kirocrew --version 2>/dev/null | grep -q "${KIROCREW_VERSION}"; then
  skip "kirocrew ${KIROCREW_VERSION}"
else
  curl -fsSL https://download.crew.kiro.dev/cli.sh | sh -s -- --version "${KIROCREW_VERSION}"
fi

# --- 5. Git over https with a stored token -----------------------------------
# The token is a fine-grained PAT that Kash creates and pastes himself. This
# script never asks for it, reads it or prints it; it only sets the helper.
log "5. git credential helper"
if [ "$(git config --global credential.helper || true)" = "store" ]; then
  skip "credential.helper=store"
else
  git config --global credential.helper store
fi
token_ready() {
  GIT_TERMINAL_PROMPT=0 git ls-remote "https://github.com/${GH_OWNER}/ghostlight.git" HEAD >/dev/null 2>&1
}

# --- 6. Clone both repos as siblings ----------------------------------------
log "6. clone ghostlight and ghostlight-crew"
CLONED=1
for pair in "ghostlight:$GHOSTLIGHT_DIR" "ghostlight-crew:$CREW_DIR"; do
  repo="${pair%%:*}"; dir="${pair#*:}"
  if [ -d "$dir/.git" ]; then
    skip "$dir"
  elif token_ready; then
    GIT_TERMINAL_PROMPT=0 git clone -q "https://github.com/${GH_OWNER}/${repo}.git" "$dir"
  else
    echo "[setup]   cannot read GitHub yet (no token stored). Skipping clones; see checklist."
    CLONED=0
    break
  fi
done

if [ "$CLONED" -eq 1 ]; then
  # Reports are committed on the box only. Identity is repo-local.
  if [ -z "$(git -C "$CREW_DIR" config user.name || true)" ]; then
    git -C "$CREW_DIR" config user.name "Crew nightly (VM)"
    git -C "$CREW_DIR" config user.email "266551286+${GH_OWNER}@users.noreply.github.com"
  else
    skip "crew git identity"
  fi

  # --- 7. ghostlight deps, Chrome, engine -----------------------------------
  log "7a. npm ci in ghostlight"
  if [ -d "$GHOSTLIGHT_DIR/node_modules" ]; then
    skip "node_modules present"
  else
    (cd "$GHOSTLIGHT_DIR" && npm ci)
  fi

  log "7b. Google Chrome (via Playwright, used by the live-site check)"
  if have google-chrome; then
    skip "$(google-chrome --version)"
  else
    (cd "$GHOSTLIGHT_DIR" && sudo npx --yes playwright install --with-deps chrome)
  fi

  log "7c. ScummVM checkout and Drascula freeware data (repo's fetch script)"
  (cd "$GHOSTLIGHT_DIR" && scripts/fetch.sh)

  log "7d. native engine build"
  if [ -x "$GHOSTLIGHT_DIR/vendor/scummvm/scummvm" ]; then
    skip "engine binary present (rerun scripts/build-engine.sh --reconfigure by hand after engine changes)"
  else
    (cd "$GHOSTLIGHT_DIR" && scripts/build-engine.sh)
  fi
fi

# --- 8. Nightly wrapper -------------------------------------------------------
log "8. ~/bin/ghostlight-nightly.sh"
mkdir -p "$HOME/bin"
WRAPPER="$HOME/bin/ghostlight-nightly.sh"
cat > "$WRAPPER.new" <<'EOF'
#!/bin/sh
# Crew nightly on the VM. The checkout is refreshed by the ghostlight-pull user timer (01:50), outside Crew, so the token never enters the agent sandbox. Runs
# the room survey + live check under a virtual display. Reports commit locally only.
set -u
export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin"
cd "$HOME/ghostlight-crew" || exit 1
SDL_AUDIODRIVER=dummy exec xvfb-run -a node scripts/nightly-rooms.mjs
EOF
if [ -f "$WRAPPER" ] && cmp -s "$WRAPPER" "$WRAPPER.new"; then
  rm "$WRAPPER.new"; skip "wrapper unchanged"
else
  mv "$WRAPPER.new" "$WRAPPER"
fi
chmod +x "$WRAPPER"

# --- 9. Pull timer, outside Crew ---------------------------------------------
# Crew's sandbox hides ~/.git-credentials from jobs, so the pull runs as a plain
# user systemd timer ten minutes before the Crew job.
log "9. ghostlight-pull user timer (${PULL_TIME} ${CRON_TZ})"
UNIT_DIR="$HOME/.config/systemd/user"
mkdir -p "$UNIT_DIR"
cat > "$UNIT_DIR/ghostlight-pull.service" <<'EOF'
[Unit]
Description=Refresh the ghostlight checkout before the Crew nightly
[Service]
Type=oneshot
WorkingDirectory=%h/ghostlight
Environment=GIT_TERMINAL_PROMPT=0
ExecStart=/usr/bin/git pull --ff-only -q
EOF
cat > "$UNIT_DIR/ghostlight-pull.timer" <<EOF
[Unit]
Description=Pull ghostlight at 01:50 London, ahead of the 02:00 Crew nightly
[Timer]
OnCalendar=*-*-* ${PULL_TIME} ${CRON_TZ}
[Install]
WantedBy=timers.target
EOF

# --- 10. Linger, so user units and Crew runtimes survive logout --------------
log "10. loginctl enable-linger"
if [ "$(loginctl show-user "$USER" -p Linger --value 2>/dev/null || true)" = "yes" ]; then
  skip "linger on"
else
  sudo loginctl enable-linger "$USER"
fi
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
systemctl --user daemon-reload
systemctl --user enable --now ghostlight-pull.timer >/dev/null

# --- 11. Crew as a system service --------------------------------------------
log "11. kirocrew service"
if systemctl is-active --quiet kirocrew 2>/dev/null; then
  skip "kirocrew.service active"
else
  kirocrew service install
fi

# --- 12. The 02:00 nightly as a zero-token Crew script job -------------------
# A --command job only reports to the dashboard. The poster script runs the
# wrapper and posts its summary to the Discord night-jobs thread (THREAD in
# scripts/crew/ghostlight_post.py, which must be in discord.allowed_thread_ids).
log "12. Crew cron job ${CRON_NAME}"
mkdir -p "$HOME/.kiro/crew/crons"
install -m 644 "$CREW_DIR/scripts/crew/ghostlight_post.py" "$HOME/.kiro/crew/crons/ghostlight_post.py"
if kirocrew cron list 2>/dev/null | grep -q " ${CRON_NAME} "; then
  skip "job ${CRON_NAME} exists"
else
  kirocrew cron add "${CRON_NAME}" "$WRAPPER" \
    --cron "${CRON_EXPR}" --timezone "${CRON_TZ}" \
    --script "$HOME/.kiro/crew/crons/ghostlight_post.py:run" --timeout 1700 --timeout-secs 1760
fi

# --- Checklist for Kash ------------------------------------------------------
cat <<EOF

=====================================================================
 Done with the automated part. By hand, in this order:
=====================================================================
 [$(token_ready && echo x || echo ' ')] GitHub token: fine-grained PAT, repos ghostlight + ghostlight-crew,
      Contents: Read-only. Paste it yourself into ~/.git-credentials as
      https://x-access-token:<token>@github.com (chmod 600), then rerun this script.
 [$(kiro-cli whoami >/dev/null 2>&1 && echo x || echo ' ')] kiro-cli login  (Builder ID, device code in the browser)
 [$([ -d "$CREW_DIR/.saves" ] && echo x || echo ' ')] Copy .saves/ into $CREW_DIR/.saves  (game state, never committed)
 [ ] Connect Discord: dashboard Settings > Messaging Channels > Discord (SSH tunnel
      to port 5476, kirocrew token), paste the bot token there, then
      kirocrew config set discord.allowed_user_ids / allowed_channel_ids /
      allowed_thread_ids, and adopt the jobs to that thread's session
 [ ] Chapter drafting jobs (agent at 03:00, commit at 05:45) are set up by hand:
      see VM-SETUP.md
 [ ] Test fire: kirocrew cron list, then kirocrew cron trigger <job id>
 [ ] Pause the job on any other machine still running it
=====================================================================
EOF
