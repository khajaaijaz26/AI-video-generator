@echo off
echo ============================================
echo   AI Video Generator - Local Startup
echo ============================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org/downloads
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

REM Check FFmpeg
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] FFmpeg not found. Install from https://ffmpeg.org/download.html and add to PATH
    pause
    exit /b 1
)

echo [OK] All prerequisites found.
echo.

REM Create backend .env if missing
if not exist "backend\.env" (
    echo Creating backend\.env from example...
    copy "backend\.env.example" "backend\.env"
    echo [!] Please edit backend\.env and add your API keys
    notepad "backend\.env"
)

REM Create frontend .env.local if missing
if not exist "frontend\.env.local" (
    echo Creating frontend\.env.local from example...
    copy "frontend\.env.local.example" "frontend\.env.local"
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt --quiet
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
if not exist "node_modules" npm install --silent
cd ..

echo.
echo Starting backend (http://localhost:8000)...
start "Backend - AI Video Generator" cmd /k "cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo Starting frontend (http://localhost:3000)...
start "Frontend - AI Video Generator" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo   Both servers starting up!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo   Open http://localhost:3000 in your browser
echo ============================================
echo.
timeout /t 5 /nobreak >nul
start http://localhost:3000
