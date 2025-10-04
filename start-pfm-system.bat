@echo off
echo =====================================================
echo         PFM Tools - Complete System Startup
echo =====================================================
echo.

:: Set the root directory
set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo Starting PFM System Components...
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and try again.
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install npm and try again.
    pause
    exit /b 1
)

echo All prerequisites found!
echo.

:: Create a timestamp for logs
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

:: Create logs directory if it doesn't exist
if not exist "%ROOT_DIR%\logs" mkdir "%ROOT_DIR%\logs"

echo =====================================================
echo 1. Starting ML Service (Python Flask - Port 8000)
echo =====================================================
echo Installing Python dependencies...
cd /d "%ROOT_DIR%\ml-services"
pip install -r requirements.txt >"%ROOT_DIR%\logs\ml-install-%timestamp%.log" 2>&1
if errorlevel 1 (
    echo WARNING: Some Python packages may have failed to install
    echo Check %ROOT_DIR%\logs\ml-install-%timestamp%.log for details
)

echo Starting ML Service in new window...
start "PFM ML Service" cmd /k "cd /d \"%ROOT_DIR%\ml-services\" && echo ML Service Starting... && python app.py"
timeout /t 3 /nobreak >nul

echo =====================================================
echo 2. Starting Backend Service (Node.js - Port 5000)
echo =====================================================
echo Installing Node.js dependencies...
cd /d "%ROOT_DIR%\backend"
npm install >"%ROOT_DIR%\logs\backend-install-%timestamp%.log" 2>&1
if errorlevel 1 (
    echo WARNING: Some npm packages may have failed to install
    echo Check %ROOT_DIR%\logs\backend-install-%timestamp%.log for details
)

echo Starting Backend Service in new window...
start "PFM Backend" cmd /k "cd /d \"%ROOT_DIR%\backend\" && echo Backend Service Starting... && npm start"
timeout /t 3 /nobreak >nul

echo =====================================================
echo 3. Starting Frontend Service (Next.js - Port 3000)
echo =====================================================
echo Installing frontend dependencies...
cd /d "%ROOT_DIR%\frontend\my-app"
npm install >"%ROOT_DIR%\logs\frontend-install-%timestamp%.log" 2>&1
if errorlevel 1 (
    echo WARNING: Some npm packages may have failed to install
    echo Check %ROOT_DIR%\logs\frontend-install-%timestamp%.log for details
)

echo Starting Frontend Service in new window...
start "PFM Frontend" cmd /k "cd /d \"%ROOT_DIR%\frontend\my-app\" && echo Frontend Service Starting... && npm run dev"
timeout /t 5 /nobreak >nul

echo =====================================================
echo           ALL SERVICES STARTED SUCCESSFULLY!
echo =====================================================
echo.
echo Services Running:
echo.
echo   🤖 ML Service:      http://localhost:8000
echo   🔧 Backend API:     http://localhost:5000
echo   🌐 Frontend App:    http://localhost:3000
echo.
echo =====================================================
echo                   SERVICE STATUS
echo =====================================================
echo.
echo ML Service (Flask):    Port 8000 - Machine Learning Predictions
echo Backend (Express):     Port 5000 - API Server and Database
echo Frontend (Next.js):    Port 3000 - Web Application
echo.
echo =====================================================
echo                 IMPORTANT NOTES
echo =====================================================
echo.
echo 1. Wait 30-60 seconds for all services to fully start
echo 2. Open http://localhost:3000 in your browser
echo 3. Make sure MongoDB is running on your system
echo 4. Close all service windows to stop the system
echo 5. Check logs in the 'logs' folder if issues occur
echo.
echo =====================================================
echo               TROUBLESHOOTING TIPS
echo =====================================================
echo.
echo - If ports are busy, check for running services
echo - Ensure MongoDB is running before using the app
echo - Check Windows Firewall if connection issues occur
echo - Use 'netstat -an ^| findstr :3000' to check port status
echo - Use 'netstat -an ^| findstr :5000' to check backend
echo - Use 'netstat -an ^| findstr :8000' to check ML service
echo.
echo Press any key to open the application in your browser...
pause >nul

:: Open the application in default browser
start http://localhost:3000

echo.
echo System is now running! Close this window to keep services active.
echo To stop all services, close the individual service windows.
echo.
pause