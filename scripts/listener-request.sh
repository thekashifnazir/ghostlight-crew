#!/bin/sh
# listener-request.sh: the Crew job side of the listener bot. The Mac Crew
# sandbox can't run prlctl (Parallels refuses to start from inside it), so this
# job only drops a request file. A launchd agent outside Crew
# (com.ghostlight.listener, QueueDirectories) runs scripts/listener.sh on it.
# This waits up to 28 min for that run's result and prints it, so the result
# shows in the Crew dashboard.
Q="$HOME/.ghostlight-listener"
id="$(date +%Y%m%d-%H%M%S)"
echo "$id" > "$Q/queue/$id" || { echo "listener: can't write the request file"; exit 1; }
echo "listener: requested run $id"
i=0
while [ $i -lt 336 ]; do
  if [ -f "$Q/done-$id" ]; then cat "$Q/done-$id"; grep -q "PASS" "$Q/done-$id"; exit $?; fi
  sleep 5; i=$((i+1))
done
echo "listener: no result after 28 min; see $Q/agent.log"; exit 1
