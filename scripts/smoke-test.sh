#!/usr/bin/env bash
set -Eeuo pipefail

host="127.0.0.1"
port="${PORT:-4173}"
base_url="http://${host}:${port}"
tmp_dir="$(mktemp -d)"
log_file="${tmp_dir}/dev-server.log"
home_file="${tmp_dir}/home.html"
server_pid=""

cleanup() {
  if [[ -n "${server_pid}" ]]; then
    kill "${server_pid}" 2>/dev/null || true
    wait "${server_pid}" 2>/dev/null || true
  fi
  rm -rf "${tmp_dir}"
}
trap cleanup EXIT

# Route smoke tests use the documented Node-backed dev server. The separate
# production-build CI step validates the Nitro/Cloudflare output.
./node_modules/.bin/vite dev --host "${host}" --port "${port}" --strictPort >"${log_file}" 2>&1 &
server_pid=$!

ready=0
for _ in $(seq 1 40); do
  if curl --fail --silent --show-error --connect-timeout 2 --max-time 3 \
    "${base_url}/" --output "${home_file}" 2>/dev/null; then
    ready=1
    break
  fi

  if ! kill -0 "${server_pid}" 2>/dev/null; then
    cat "${log_file}"
    echo "Development server exited before becoming ready." >&2
    exit 1
  fi

  sleep 1
done

if [[ "${ready}" -ne 1 ]]; then
  cat "${log_file}"
  echo "Development server did not become ready within 40 seconds." >&2
  exit 1
fi

if ! grep -qi "<title>NEET" "${home_file}"; then
  echo "Homepage response did not contain the NEET page title." >&2
  exit 1
fi

for route in /health /paths; do
  curl --fail --silent --show-error --connect-timeout 3 --max-time 30 \
    "${base_url}${route}" --output /dev/null
  echo "OK ${route}"
done

echo "Application route smoke checks passed."
