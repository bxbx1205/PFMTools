@echo off
echo =====================================================
echo         PFM Tools - One-Click Start
echo =====================================================

set ROOT_DIR=%~dp0

echo Starting all services...
echo.

echo [1/3] Starting ML Service (Port 8000)...
cd /d "%ROOT_DIR%\ml-services"
start "PFM ML Service" cmd /k "echo ML Service Starting... && python app.py"

echo [2/3] Starting Backend (Port 5000)...
cd /d "%ROOT_DIR%\backend"
start "PFM Backend" cmd /k "echo Backend Starting... && npm start"

echo [3/3] Starting Frontend (Port 3000)...
cd /d "%ROOT_DIR%\frontend\my-app"
start "PFM Frontend" cmd /k "echo Frontend Starting... && npm run dev"

echo.
echo =====================================================
echo               ALL SERVICES STARTING...
echo =====================================================
echo.
echo Services will be available at:
echo   ML Service:     http://localhost:8000
echo   Backend API:    http://localhost:5000
echo   Frontend App:   http://localhost:3000
echo.
echo Please wait 15-30 seconds for services to fully start...
echo.
timeout /t 15 /nobreak >nul

echo Opening application in browser...
start http://localhost:3000

echo.
echo =====================================================
echo                    SUCCESS!
echo =====================================================
echo.
echo Application should now be opening at: http://localhost:3000
echo.
echo If browser doesn't open, manually go to: http://localhost:3000
echo.
echo To stop all services: Close the service windows
echo Keep service windows open while using the application.
echo.
pause