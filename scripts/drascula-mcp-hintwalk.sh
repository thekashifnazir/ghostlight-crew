#!/bin/sh
# drascula-live MCP server for the Crew hint walker: like drascula-mcp.sh, but its own save folder.
G="$HOME/ghostlight"
export DRASCULA_MCP_TRANSPORT=native
export DRASCULA_MCP_SAVEPATH="$HOME/ghostlight-crew/.saves-hintwalk"
export DRASCULA_MCP_SCUMMVM="$G/vendor/scummvm/scummvm"
export DRASCULA_MCP_GAME="$G/vendor/game/drascula"
export DRASCULA_MCP_EXTRA="$G/vendor/scummvm/dists/engine-data"
export SDL_AUDIODRIVER=dummy
exec xvfb-run -a "$G/mcp/node_modules/.bin/tsx" "$G/mcp/src/server.ts"
