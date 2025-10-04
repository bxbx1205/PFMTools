@echo off
echo =====================================================
echo     PFM Tools - Quick Start (Development Mode)
echo =====================================================

:: Set root directory
set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo Starting development servers...
echo.

:: Start ML Service
echo [1/3] Starting ML Service...
cd /d "%ROOT_DIR%\ml-services"
start "ML-Service" cmd /k "python app.py"
timeout /t 2 /nobreak >nul

:: Start Backend
echo [2/3] Starting Backend...
cd /d "%ROOT_DIR%\backend"
start "Backend" cmd /k "npm start"
timeout /t 2 /nobreak >nul

:: Start Frontend
echo [3/3] Starting Frontend...
cd /d "%ROOT_DIR%\frontend\my-app"
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ✅ All services started!
echo.
echo 🤖 ML Service:    http://localhost:8000
echo 🔧 Backend:       http://localhost:5000  
echo 🌐 Frontend:      http://localhost:3000
echo.
echo Opening application...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Close service windows to stop the system.
pause