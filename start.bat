@echo off
echo "Starting ThePrintProject Services..."

rem Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: npm is not installed or not in the PATH.
  exit /b 1
)

rem Set base directories
set BASE_DIR=%~dp0
set CLIENT_BACKEND=%BASE_DIR%client-backend
set ELECTRON_APP=%BASE_DIR%electron-app

echo "Starting client-backend service..."
start powershell.exe -Command "cd '%CLIENT_BACKEND%'; npm start"

echo "Waiting for backend to initialize (5 seconds)..."
timeout /t 5 /nobreak >nul

echo "Starting electron-app service..."
start powershell.exe -Command "cd '%ELECTRON_APP%'; npm run dev:electron"

echo "All services started. The application should open shortly."
echo "Press any key to exit this script..."
pause >nul
