@echo off
title Kho Luu Tru FileVault
color 0b

echo ================================================================
echo           KHO LUU TRU ANH VA TAP TIN - FILEVAULT
echo ================================================================
echo.

:: 1. Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=%PATH%;C:\Program Files\nodejs"
    ) else (
        color 0c
        echo [LOI] May tinh chua cai dat Node.js!
        echo Vui long tai Node.js tai: https://nodejs.org
        echo.
        pause
        exit /b 1
    )
)

:: 2. Giai phong cong 5000 neu bi chiem truoc do
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul

:: 3. Chuyen den thu muc du an
cd /d "%~dp0"

:: 4. Kiem tra thu vien server
if not exist "server\node_modules" goto INSTALL_DEPS
goto START_SERVER

:INSTALL_DEPS
echo [1/2] Dang cai dat thu vien may chu...
cd server
call npm install
cd /d "%~dp0"
echo.

:START_SERVER
echo [2/2] Dang khoi dong may chu...
echo.
echo ================================================================
echo  UNG DUNG DA SAN SANG!
echo  Trinh duyet web se mo tai: http://localhost:5000
echo  Vui long khong tat cua so nay khi dang su dung
echo ================================================================
echo.

start "" "http://localhost:5000"

cd /d "%~dp0server"
node src/server.js

if %errorlevel% neq 0 (
    echo.
    color 0c
    echo [LOI] May chu bi dung!
    pause
)
