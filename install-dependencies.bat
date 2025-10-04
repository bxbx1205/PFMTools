@echo off
echo =====================================================
echo    PFM Tools - Install Dependencies Only
echo =====================================================

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo Installing all project dependencies...
echo.

echo [1/3] Installing Python dependencies for ML Service...
cd /d "%ROOT_DIR%\ml-services"
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo [2/3] Installing Node.js dependencies for Backend...
cd /d "%ROOT_DIR%\backend"
npm install
if errorlevel 1 (
    echo ERROR: Failed to install Backend dependencies
    pause
    exit /b 1
)

echo [3/3] Installing Node.js dependencies for Frontend...
cd /d "%ROOT_DIR%\frontend\my-app"
npm install
if errorlevel 1 (
    echo ERROR: Failed to install Frontend dependencies
    pause
    exit /b 1
)

echo.
echo ✅ All dependencies installed successfully!
echo.
echo You can now use quick-start.bat or start-pfm-system.bat
echo.
pause