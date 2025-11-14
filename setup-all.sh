#!/bin/bash
# Accorria Complete Setup - Run this single command in WSL
# Copy and paste this entire block into your WSL terminal

cd ~/code/accorria/Accorria_Beta/Accorria_Beta && \
echo "🚀 Starting Accorria setup..." && \
echo "📦 Installing root npm dependencies..." && \
npm install && \
echo "📦 Installing frontend npm dependencies..." && \
cd frontend && npm install && cd .. && \
echo "🐍 Setting up Python virtual environment..." && \
cd backend && \
if [ ! -d ".venv" ]; then python3 -m venv .venv; fi && \
source .venv/bin/activate && \
pip install --upgrade pip -q && \
pip install -r requirements.txt && \
cd .. && \
echo "📝 Setting up environment files..." && \
[ ! -f backend/.env ] && cp backend/env.example backend/.env && echo "✅ Created backend/.env" || echo "✅ Backend/.env already exists" && \
[ ! -f frontend/.env.local ] && cp frontend/env.example frontend/.env.local && echo "✅ Created frontend/.env.local" || echo "✅ Frontend/.env.local already exists" && \
echo "" && \
echo "✅ Setup complete!" && \
echo "" && \
echo "📋 Next steps:" && \
echo "1. Update backend/.env with your API keys" && \
echo "2. Update frontend/.env.local with your Supabase and API keys" && \
echo "" && \
echo "🚀 To start the application, run: npm run dev"

