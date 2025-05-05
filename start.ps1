# start.ps1  (repo root)
param()

# 1) copy env if first run
if (-not (Test-Path ".env")) { Copy-Item ".env.sample" ".env" }

# 2) start Ollama server if not already running
if (-not (Get-Process -Name ollama -ErrorAction SilentlyContinue)) {
  Write-Host "🚀 Starting Ollama..."
  Start-Process ollama "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 5
}

# 3) install packages & run dev servers
npm install --silent
npm run dev
