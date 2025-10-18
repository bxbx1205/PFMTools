@echo off
setlocal enabledelayedexpansion
echo =====================================================
echo         PFM Tools - Personal Finance Manager
echo =====================================================
echo.
set ROOT_DIR=%~dp0
set ML_DIR=%ROOT_DIR%ml-services
set BACKEND_DIR=%ROOT_DIR%backend
set FRONTEND_DIR=%ROOT_DIR%frontend\my-app
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)
echo Checking dependencies...
echo.
if not exist "%BACKEND_DIR%\node_modules" (
    echo [!] Installing Backend dependencies...
    cd /d "%BACKEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
)
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [!] Installing Frontend dependencies...
    cd /d "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
python -c "import flask, flask_cors, pandas, scikit_learn, joblib" 2>nul
if errorlevel 1 (
    echo [!] Installing Python dependencies...
    cd /d "%ML_DIR%"
    call pip install flask flask-cors pandas scikit-learn joblib
    if errorlevel 1 (
        echo ERROR: Failed to install Python dependencies
        pause
        exit /b 1
    )
)
echo.
echo =====================================================
echo            Starting All Services...
echo =====================================================
echo.
echo [1/3] Starting ML Service on Port 8000...
cd /d "%ML_DIR%"
start "PFM - ML Service" cmd /k "cd /d "%ML_DIR%" && python app.py"
timeout /t 3 /nobreak >nul
echo [2/3] Starting Backend API on Port 5000...
cd /d "%BACKEND_DIR%"
start "PFM - Backend API" cmd /k "cd /d "%BACKEND_DIR%" && npm start"
timeout /t 3 /nobreak >nul
echo [3/3] Starting Frontend on Port 3000...
cd /d "%FRONTEND_DIR%"
start "PFM - Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"
timeout /t 5 /nobreak >nul
echo.
echo =====================================================
echo              SERVICES STARTED SUCCESSFULLY
echo =====================================================
echo.
echo Application Components:
echo   - ML Service:      http://localhost:8000
echo   - Backend API:     http://localhost:5000
echo   - Frontend:        http://localhost:3000
echo.
echo Waiting for services to initialize...
timeout /t 10 /nobreak >nul
echo.
echo Opening application in browser...
start http://localhost:3000
echo.
echo =====================================================
echo                       READY
echo =====================================================
echo.
echo Frontend should open automatically at:
echo   http://localhost:3000
echo.
echo If it doesn't open, manually visit: http://localhost:3000
echo.
echo IMPORTANT: Keep all service windows open while using the app.
echo.
echo To stop all services: Close all command windows
echo.
pause
