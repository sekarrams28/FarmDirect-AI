@echo off
REM ==========================================================================
REM  FarmDirect AI — one-click OFFLINE startup (Windows)
REM  Starts MongoDB, the Python AI service, the Node/Express backend and
REM  the React/Vite frontend, in that order, each in its own window.
REM
REM  One-time setup (needs internet, do this BEFORE going offline):
REM    cd backend      && npm install && copy .env.example .env
REM    cd ai-service   && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
REM    cd frontend     && npm install && copy .env.example .env
REM ==========================================================================

setlocal
set ROOT=%~dp0
echo.
echo ===============================================
echo   FarmDirect AI - offline startup
echo ===============================================
echo.

REM ---- 1. Local MongoDB ----------------------------------------------------
echo [1/4] Starting local MongoDB (localhost:27017)...
where mongod >nul 2>nul
if %errorlevel%==0 (
    net start MongoDB >nul 2>nul
    if %errorlevel% neq 0 (
        echo    MongoDB service not registered - launching mongod directly.
        start "FarmDirect - MongoDB" cmd /k "mongod --dbpath %ROOT%mongo-data"
    ) else (
        echo    MongoDB service started.
    )
) else (
    echo    WARNING: "mongod" was not found on PATH.
    echo    Install MongoDB Community Server, or start it manually, then re-run this script.
)
timeout /t 3 /nobreak >nul

REM ---- 2. Python AI service --------------------------------------------------
echo [2/4] Starting Python AI service (localhost:8000)...
if exist "%ROOT%ai-service\venv\Scripts\activate.bat" (
    start "FarmDirect - AI Service" cmd /k "cd /d %ROOT%ai-service && call venv\Scripts\activate && uvicorn main:app --port 8000"
) else (
    echo    WARNING: ai-service\venv not found.
    echo    Run: cd ai-service && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
    start "FarmDirect - AI Service" cmd /k "cd /d %ROOT%ai-service && uvicorn main:app --port 8000"
)
timeout /t 3 /nobreak >nul

REM ---- 3. Node/Express backend ----------------------------------------------
echo [3/4] Starting Node/Express backend (localhost:5000)...
if not exist "%ROOT%backend\node_modules" (
    echo    WARNING: backend\node_modules not found. Run "npm install" in backend\ first.
)
if not exist "%ROOT%backend\.env" (
    echo    backend\.env not found - copying from .env.example.
    copy "%ROOT%backend\.env.example" "%ROOT%backend\.env" >nul
)
start "FarmDirect - Backend" cmd /k "cd /d %ROOT%backend && npm run dev"
timeout /t 3 /nobreak >nul

REM ---- 4. React/Vite frontend -------------------------------------------------
echo [4/4] Starting React/Vite frontend (localhost:5173)...
if not exist "%ROOT%frontend\node_modules" (
    echo    WARNING: frontend\node_modules not found. Run "npm install" in frontend\ first.
)
if not exist "%ROOT%frontend\.env" (
    echo    frontend\.env not found - copying from .env.example.
    copy "%ROOT%frontend\.env.example" "%ROOT%frontend\.env" >nul
)
start "FarmDirect - Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo ===============================================
echo   All services launching in separate windows.
echo   Frontend:   http://localhost:5173
echo   Backend:    http://localhost:5000/api/health
echo   AI service: http://localhost:8000/health
echo   MongoDB:    localhost:27017
echo.
echo   You can now disconnect Wi-Fi / Ethernet and use
echo   the app fully offline.
echo ===============================================
echo.
pause
endlocal
