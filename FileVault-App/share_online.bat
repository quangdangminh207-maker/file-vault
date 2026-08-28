@echo off
title Chia Se FileVault Ra Toan The Gioi
color 0a

echo ================================================================
echo           CHIA SE KHO LUU TRU FILEVAULT RA INTERNET
echo ================================================================
echo.
echo [1/2] Dang lay dia chi IP cua ban...
for /f "tokens=*" %%a in ('curl -s https://api.ipify.org') do set PUBLIC_IP=%%a

echo Dia chi IP bao mat cua ban la: %PUBLIC_IP%
echo (Neu trang web yeu cau "Tunnel Password", hay nhap: %PUBLIC_IP%)
echo.
echo [2/2] Dang tao duong link HTTPS truc tuyen...
echo ================================================================
echo.

npx --yes localtunnel --port 5000

pause
