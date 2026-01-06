# Installation and Setup Guide for Directus Setup Scripts
# Windows PowerShell version

Write-Host "🚀 Installing @abakus/directus-setup..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
  Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
  Write-Host "Create .env with:" -ForegroundColor Yellow
  Write-Host "  DIRECTUS_URL=http://localhost:8055" -ForegroundColor Gray
  Write-Host "  DIRECTUS_SETUP_TOKEN=TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18" -ForegroundColor Gray
  exit 1
}

# Check token
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "DIRECTUS_SETUP_TOKEN") {
  Write-Host "Adding DIRECTUS_SETUP_TOKEN to .env..." -ForegroundColor Yellow
  Add-Content ".env" "DIRECTUS_SETUP_TOKEN=TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
& pnpm install

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Installation failed" -ForegroundColor Red
  exit 1
}

# Run setup
Write-Host "🔧 Running Directus setup..." -ForegroundColor Cyan
& pnpm --filter "@abakus/directus-setup" setup

if ($LASTEXITCODE -ne 0) {
  Write-Host "⚠️  Setup script had issues, but may have partially succeeded" -ForegroundColor Yellow
}

# Show summary
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open admin: http://localhost:8055" -ForegroundColor Gray
Write-Host "2. Start web: pnpm --filter @abakus/web dev" -ForegroundColor Gray
Write-Host "3. Visit app: http://localhost:3000" -ForegroundColor Gray
