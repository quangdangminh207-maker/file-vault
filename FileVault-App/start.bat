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
    color 0c
    echo [LOI] May tinh cua ban chua cai dat Node.js!
    echo Vui long tai va cai dat Node.js tai: https://nodejs.org
    echo.
    pause
    exit /b
)

:: 2. Chuyen den thu muc du an
cd /d "%~dp0"

:: 3. Kiem tra thu vien server
if not exist "server\node_modules" (
    echo [1/2] Dang cai dat thu vien may chu (chi chay lan dau)...
    cd server
    call npm install
    cd /d "%~dp0"
    echo.
)

:: 4. Mo trinh duyet va khoi dong server
echo [2/2] Dang khoi dong may chu...
echo.
echo ================================================================
echo  UNG DUNG DA SAN SANG!
echo  Trinh duyet web se mo tai: http://localhost:5000
echo  (Vui long khong tat cua so nay khi dang su dung trang web)
echo ================================================================
echo.

start "" "http://localhost:5000"

cd /d "%~dp0server"
node src/server.js

if %errorlevel% neq 0 (
    echo.
    color 0c
    echo [LOI] May chu da bi dung!
    pause
)
