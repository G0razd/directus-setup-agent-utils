@echo off
REM Installation script for @abakus/directus-setup on Windows

echo.
echo ============================================================
echo     Abakus Akademie - Directus Setup Installation
echo ============================================================
echo.

REM Check for .env file
if not exist ".env" (
    echo [WARNING] .env file not found
    echo.
    echo Creating .env with token...
    (
        echo # Directus Configuration
        echo DIRECTUS_URL=http://localhost:8055
        echo DIRECTUS_SETUP_TOKEN=TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18
        echo DIRECTUS_MCP_TOKEN=TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18
    ) > .env
    echo [OK] .env created
)

echo.
echo [1/3] Installing dependencies...
call pnpm install
if errorlevel 1 (
    echo [ERROR] pnpm install failed
    exit /b 1
)

echo.
echo [2/3] Running Directus setup...
call pnpm --filter "@abakus/directus-setup" setup
if errorlevel 1 (
    echo [WARNING] Setup script had issues
)

echo.
echo [3/3] Verifying setup...
call pnpm --filter "@abakus/directus-setup" verify

echo.
echo ============================================================
echo     Installation Complete!
echo ============================================================
echo.
echo Next steps:
echo   1. Open Directus:  http://localhost:8055
echo   2. Start web:      pnpm --filter @abakus/web dev
echo   3. Visit app:      http://localhost:3000
echo.
echo Documentation:
echo   Quick Start:       scripts/directus-setup/QUICKSTART.md
echo   Full Docs:         scripts/directus-setup/README.md
echo   For AI Agents:     scripts/directus-setup/AGENT_GUIDE.md
echo.
pause
