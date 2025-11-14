#!/bin/bash
# Start Accorria development servers
# Run this from WSL: bash start-dev.sh

cd "$(dirname "$0")"

echo "🚀 Starting Accorria development servers..."
echo ""

# Start backend in background
echo "🔧 Starting backend server on port 8000..."
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend server on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting..."
echo "📡 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

