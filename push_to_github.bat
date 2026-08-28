@echo off
title Day Ma Nguon Len GitHub
color 0b

echo ================================================================
echo           DAY KHO LUU TRU FILEVAULT LEN GITHUB
echo ================================================================
echo.
echo Link GitHub cua ban: https://github.com/quangdangminh207-maker/file-vault.git
echo.
echo Bam phim bat ky hoac ENTER de bat dau dong bo...
pause >nul

echo.
echo Dang day ma nguon moi len GitHub...
cd /d "%~dp0"
git remote remove origin >nul 2>nul
git remote add origin https://github.com/quangdangminh207-maker/file-vault.git
git branch -M main
git add .
git commit -m "Update FileVault App with Google Login" >nul 2>nul
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    color 0a
    echo ================================================================
    echo  DA DAY MA NGUON LEN GITHUB THANH CONG!
    echo  Render.com se tu dong cap nhat phien ban moi trong 1 phut.
    echo ================================================================
) else (
    echo.
    color 0c
    echo [LOI] Khong the day ma nguon len GitHub. Hay kiem tra ket noi mang.
)

echo.
pause
