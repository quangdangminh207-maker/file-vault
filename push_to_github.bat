@echo off
title Day Ma Nguon Len GitHub
color 0b

echo ================================================================
echo           DAY KHO LUU TRU FILEVAULT LEN GITHUB
echo ================================================================
echo.
echo Hay dam bao ban da tao 1 repository tren trang https://github.com
echo.
set /p REPO_URL="Dan duong link GitHub cua ban vao day (vi du: https://github.com/tenban/file-vault.git): "

if "%REPO_URL%"=="" (
    echo.
    color 0c
    echo [LOI] Ban chua nhap link GitHub!
    pause
    exit /b
)

echo.
echo Dang day ma nguon len GitHub...
cd /d "%~dp0"
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
git branch -M main
git add .
git commit -m "FileVault App" >nul 2>nul
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    color 0a
    echo ================================================================
    echo  DA DAY MA NGUON LEN GITHUB THANH CONG!
    echo  Bay gio ban co the vao https://render.com de ket noi chay 24/7.
    echo ================================================================
) else (
    echo.
    color 0c
    echo [LOI] Khong the day ma nguon len GitHub. Hay kiem tra lai link va quyen dang nhap.
)

echo.
pause
