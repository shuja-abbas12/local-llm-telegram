#!/usr/bin/env bash
set -e

# 1) Copy in the .env template if needed
[ -f .env ] || cp .env.sample .env

# 2) Ensure Homebrew is installed (needed for next steps)
if ! command -v brew &>/dev/null; then
  echo "🍺 Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# 3) Ensure Node.js 20 LTS is installed
if ! command -v node &>/dev/null; then
  echo "📦 Installing Node.js..."
  brew install node@20
  brew link --force --overwrite node@20
fi

# 4) Ensure Ollama CLI is installed
if ! command -v ollama &>/dev/null; then
  echo "🤖 Installing Ollama..."
  brew install ollama
fi

# 5) Start Ollama in the background if not already running
if ! pgrep -x ollama >/dev/null; then
  echo "🚀 Launching Ollama..."
  ollama serve >/dev/null 2>&1 &
  sleep 5
fi

# 6) Pull a default model on first run (silently ignore errors if already pulled)
ollama pull llama2 2>/dev/null || true

# 7) Install JS dependencies and start your backend + UI
echo "📂 Installing project dependencies..."
npm install --silent
echo "🔧 Starting backend and UI..."
npm run dev &

# 8) Auto-open the web UI in the default browser
echo "🌐 Opening chat UI at http://localhost:5173..."
open "http://localhost:5173"
