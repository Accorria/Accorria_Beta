#!/bin/bash
# Fix Python virtual environment setup on WSL/Ubuntu

echo "🔧 Installing required Python packages..."
echo ""

# Install python3-venv and python3-pip
sudo apt update
sudo apt install -y python3.12-venv python3-pip

echo ""
echo "✅ Python packages installed"
echo ""
echo "Now you can create the virtual environment:"
echo "  cd backend"
echo "  python3 -m venv .venv"
echo "  source .venv/bin/activate"
echo "  pip install --upgrade pip"
echo "  pip install -r requirements.txt"

