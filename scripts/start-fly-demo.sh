#!/usr/bin/env bash
set -euo pipefail

# The volume is attached at /data; never expose Temporal's unauthenticated dev port.
mkdir -p /data
temporal server start-dev --headless --ip 127.0.0.1 \
  --db-filename /data/temporal.db &
temporal_pid=$!
pids=("$temporal_pid")

cleanup() {
  trap - EXIT TERM INT
  kill "${pids[@]}" 2>/dev/null || true
  wait "${pids[@]}" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 0' TERM INT

ready=false
for _ in {1..60}; do
  if temporal operator cluster health --address 127.0.0.1:7233 >/dev/null 2>&1; then
    ready=true
    break
  fi
  if ! kill -0 "$temporal_pid" 2>/dev/null; then
    echo "Temporal server stopped during startup" >&2
    exit 1
  fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  echo "Temporal server did not become healthy" >&2
  exit 1
fi

bun run worker &
worker_pid=$!
pids+=("$worker_pid")
./node_modules/.bin/next start -H 0.0.0.0 -p 3000 &
web_pid=$!
pids+=("$web_pid")

# Restart the Machine if any of the three processes stops unexpectedly.
wait -n "${pids[@]}" || true
echo "A demo process exited; stopping the rest" >&2
exit 1
