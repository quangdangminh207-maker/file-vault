@echo off
title Kho Luu Tru FileVault
echo ====================================================
echo       KHO LUU TRU ANH VA TAP TIN - FILEVAULT
echo ====================================================
echo.

cd /d "%~dp0server"

if not exist "node_modules" (
    echo [1/2] Dang cai dat cac thu vien can thiet (chi chay lan dau)...
    call npm install
)

echo.
echo [2/2] Dang khoi dong may chu tai http://localhost:5000 ...
echo.
echo ====================================================
echo Hay mo trinh duyet va truy cap: http://localhost:5000
echo ====================================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:5000
node src/server.js
pause
