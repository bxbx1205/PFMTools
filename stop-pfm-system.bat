@echo off
echo =====================================================
echo        PFM Tools - System Stop Script
echo =====================================================

echo Stopping PFM system services...
echo.

:: Kill processes by port
echo Stopping services on ports 3000, 5000, and 8000...

:: Stop processes using specific ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo Stopping process %%a on port 3000...
        taskkill /PID %%a /F >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    if not "%%a"=="0" (
        echo Stopping process %%a on port 5000...
        taskkill /PID %%a /F >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    if not "%%a"=="0" (
        echo Stopping process %%a on port 8000...
        taskkill /PID %%a /F >nul 2>&1
    )
)

:: Kill Node.js and Python processes that might be hanging
echo Cleaning up remaining processes...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM python.exe /F >nul 2>&1

echo.
echo ✅ All PFM services have been stopped.
echo.
pause