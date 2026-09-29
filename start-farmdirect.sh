#!/usr/bin/env bash
# ==============================================================================
# FarmDirect AI — one-click OFFLINE startup (macOS/Linux)
# Mirrors start-farmdirect.bat for non-Windows machines. Starts MongoDB, the
# Python AI service, the Node/Express backend and the React/Vite frontend.
#
# One-time setup (needs internet, do this BEFORE going offline):
#   (cd backend && npm install && cp .env.example .env)
#   (cd ai-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt)
#   (cd frontend && npm install && cp .env.example .env)
# ==============================================================================
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==============================================="
echo "  FarmDirect AI - offline startup"
echo "==============================================="

echo "[1/4] Starting local MongoDB (localhost:27017)..."
if command -v mongod >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1 && brew services list 2>/dev/null | grep -q mongodb-community; then
    brew services start mongodb-community >/dev/null 2>&1 && echo "    MongoDB service started (brew)."
  elif command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files 2>/dev/null | grep -q mongod; then
    sudo systemctl start mongod && echo "    MongoDB service started (systemd)."
  else
    mkdir -p "$ROOT/mongo-data"
    nohup mongod --dbpath "$ROOT/mongo-data" > "$ROOT/mongo-data/mongod.log" 2>&1 &
    echo "    mongod launched directly (pid $!)."
  fi
else
  echo "    WARNING: 'mongod' not found on PATH. Install MongoDB Community Server"
  echo "    or start it manually, then re-run this script."
fi
sleep 2

echo "[2/4] Starting Python AI service (localhost:8000)..."
if [ -f "$ROOT/ai-service/venv/bin/activate" ]; then
  (cd "$ROOT/ai-service" && source venv/bin/activate && uvicorn main:app --port 8000) &
else
  echo "    WARNING: ai-service/venv not found. Run:"
  echo "      cd ai-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  (cd "$ROOT/ai-service" && uvicorn main:app --port 8000) &
fi
sleep 2

echo "[3/4] Starting Node/Express backend (localhost:5000)..."
[ -d "$ROOT/backend/node_modules" ] || echo "    WARNING: backend/node_modules not found. Run 'npm install' in backend/ first."
[ -f "$ROOT/backend/.env" ] || { echo "    backend/.env not found - copying from .env.example."; cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"; }
(cd "$ROOT/backend" && npm run dev) &
sleep 2

echo "[4/4] Starting React/Vite frontend (localhost:5173)..."
[ -d "$ROOT/frontend/node_modules" ] || echo "    WARNING: frontend/node_modules not found. Run 'npm install' in frontend/ first."
[ -f "$ROOT/frontend/.env" ] || { echo "    frontend/.env not found - copying from .env.example."; cp "$ROOT/frontend/.env.example" "$ROOT/frontend/.env"; }
(cd "$ROOT/frontend" && npm run dev) &

echo ""
echo "==============================================="
echo "  All services launching in the background."
echo "  Frontend:   http://localhost:5173"
echo "  Backend:    http://localhost:5000/api/health"
echo "  AI service: http://localhost:8000/health"
echo "  MongoDB:    localhost:27017"
echo ""
echo "  Press Ctrl+C to stop this script (background"
echo "  services keep running; stop them individually"
echo "  with 'kill' or your process manager)."
echo "==============================================="
wait
