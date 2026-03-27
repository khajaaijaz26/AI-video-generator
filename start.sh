#!/bin/bash
echo "============================================"
echo "  AI Video Generator - Local Startup"
echo "============================================"
echo ""

# Check prerequisites
command -v python3 &>/dev/null || { echo "[ERROR] Python3 not found"; exit 1; }
command -v node &>/dev/null || { echo "[ERROR] Node.js not found"; exit 1; }
command -v ffmpeg &>/dev/null || { echo "[ERROR] FFmpeg not found"; exit 1; }
echo "[OK] All prerequisites found."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create .env files if missing
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env"
    echo "[!] Created backend/.env - add your API keys there"
fi

if [ ! -f "$SCRIPT_DIR/frontend/.env.local" ]; then
    cp "$SCRIPT_DIR/frontend/.env.local.example" "$SCRIPT_DIR/frontend/.env.local"
fi

# Install dependencies
echo "Installing backend dependencies..."
cd "$SCRIPT_DIR/backend" && pip3 install -r requirements.txt -q

echo "Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
[ ! -d node_modules ] && npm install --silent

# Start backend
echo ""
echo "Starting backend on http://localhost:8000 ..."
cd "$SCRIPT_DIR/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 2

# Start frontend
echo "Starting frontend on http://localhost:3000 ..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "============================================"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
