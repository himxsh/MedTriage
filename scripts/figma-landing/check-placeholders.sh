#!/bin/bash
# check-placeholders.sh — fails if any REPLACE_ token remains after substitution
# Run BEFORE execution to catch missing substitutions, or AFTER to verify clean files
# Usage: ./check-placeholders.sh
set -euo pipefail
errors=0
dir="$(cd "$(dirname "$0")" && pwd)"
for f in "$dir"/*.js; do
  [ -f "$f" ] || continue
  if grep -q 'REPLACE_' "$f"; then
    echo "UNSUBSTITUTED PLACEHOLDER in $(basename "$f"):"
    grep -n 'REPLACE_' "$f"
    errors=$((errors + 1))
  fi
done
if [ "$errors" -gt 0 ]; then
  echo ""
  echo "FAILED: $errors file(s) have unsubstituted placeholders."
  echo "Run orchestrator to substitute from STATE.json before executing."
  exit 1
fi
echo "OK: no unsubstituted placeholders found."
