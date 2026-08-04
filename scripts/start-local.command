#!/bin/bash
set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "==> Starting PostgreSQL..."
PG=/opt/homebrew/opt/postgresql@16/bin
DATADIR=/opt/homebrew/var/postgresql@16
if ! "$PG/pg_isready" >/dev/null 2>&1; then
  if [ -f "$DATADIR/postmaster.pid" ]; then
    PID=$(head -1 "$DATADIR/postmaster.pid" 2>/dev/null || true)
    if [ -n "$PID" ] && ! kill -0 "$PID" 2>/dev/null; then
      echo "Removing stale postmaster.pid"
      rm -f "$DATADIR/postmaster.pid"
    fi
  fi
  "$PG/pg_ctl" -D "$DATADIR" -l /tmp/pg-medtriage.log start || true
  sleep 2
fi
"$PG/pg_isready"
"$PG/psql" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='medtriage'" | grep -q 1 || "$PG/createdb" medtriage
echo "Postgres OK"

# Start backend in background if not already up
if ! curl -sf http://localhost:8000/ >/dev/null 2>&1; then
  echo "==> Starting API on :8000..."
  # shellcheck disable=SC1091
  source "$ROOT/.venv/bin/activate"
  nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 \
    > /tmp/medtriage-api.log 2>&1 &
  echo $! > /tmp/medtriage-api.pid
fi

# Start frontend in background if not already up
if ! curl -sf http://localhost:3000/ >/dev/null 2>&1; then
  echo "==> Starting frontend on :3000..."
  (cd "$ROOT/frontend" && nohup npm run dev > /tmp/medtriage-frontend.log 2>&1 &)
fi

echo "Waiting for services..."
for i in $(seq 1 30); do
  API_OK=0; FE_OK=0
  curl -sf http://localhost:8000/ >/dev/null 2>&1 && API_OK=1
  curl -sf http://localhost:3000/ >/dev/null 2>&1 && FE_OK=1
  if [ "$API_OK" = 1 ] && [ "$FE_OK" = 1 ]; then
    echo ""
    echo "MedTriage is running:"
    echo "  Frontend  http://localhost:3000"
    echo "  API       http://localhost:8000"
    echo "  OpenAPI   http://localhost:8000/api/v1/openapi.json"
    echo ""
    echo "Logs: /tmp/medtriage-api.log  /tmp/medtriage-frontend.log"
    open http://localhost:3000
    exit 0
  fi
  sleep 1
done

echo "Timed out waiting for services. Check logs:"
echo "  /tmp/medtriage-api.log"
echo "  /tmp/medtriage-frontend.log"
echo "  /tmp/pg-medtriage.log"
exit 1
