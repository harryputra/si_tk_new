@echo off
setlocal enabledelayedexpansion

:: ============================================================
::  SI ERP TK ATTAUHID - Runner (Windows)
::  Semua output di-log ke run.log supaya error tidak hilang
::  walau jendela ditutup.
:: ============================================================

set LOG=run.log
echo ============================================================ > "%LOG%"
echo  RUN.BAT dimulai pada %DATE% %TIME% >> "%LOG%"
echo ============================================================ >> "%LOG%"

echo ============================================================
echo   SI ERP TK ATTAUHID - SYSTEM CHECK ^& RUNNER
echo ============================================================
echo  Log lengkap akan ditulis ke: %CD%\%LOG%
echo ============================================================
echo.

:: 1. Check PHP
echo [1/6] Cek PHP...
php -v >> "%LOG%" 2>&1
if errorlevel 1 (
    echo [ERROR] PHP tidak ditemukan di PATH.
    echo Lihat detail di %LOG%
    goto :end_error
)
echo   [OK] PHP terdeteksi.

:: 2. Check Composer
echo [2/6] Cek Composer...
call composer --version >> "%LOG%" 2>&1
if errorlevel 1 (
    echo [ERROR] Composer tidak ditemukan di PATH.
    echo Lihat detail di %LOG%
    goto :end_error
)
echo   [OK] Composer terdeteksi.

:: 3. Check Node/NPM
echo [3/6] Cek NPM...
call npm -v >> "%LOG%" 2>&1
if errorlevel 1 (
    echo [ERROR] NPM tidak ditemukan di PATH.
    echo Lihat detail di %LOG%
    goto :end_error
)
echo   [OK] NPM terdeteksi.

:: 4. Check .env
echo [4/6] Cek file .env...
if not exist .env (
    echo   [WARNING] .env tidak ada, menyalin dari .env.example...
    copy .env.example .env >> "%LOG%" 2>&1
    if errorlevel 1 (
        echo [ERROR] Gagal menyalin .env.example.
        goto :end_error
    )
)
echo   [OK] .env tersedia.

:: 5. Cek dependencies
echo [5/6] Cek dependencies...
if not exist vendor (
    echo   [INFO] vendor\ tidak ada, menjalankan composer install...
    call composer install >> "%LOG%" 2>&1
    if errorlevel 1 (
        echo [ERROR] composer install gagal. Lihat %LOG%
        goto :end_error
    )
)
if not exist node_modules (
    echo   [INFO] node_modules\ tidak ada, menjalankan npm install...
    call npm install >> "%LOG%" 2>&1
    if errorlevel 1 (
        echo [ERROR] npm install gagal. Lihat %LOG%
        goto :end_error
    )
)
echo   [OK] Dependencies tersedia.

:: 6. Cek & start database (Docker)
echo [6/7] Cek database PostgreSQL (Docker)...
docker ps --filter "name=si_tk_db" --filter "status=running" --format "{{.Names}}" 2>nul | findstr "si_tk_db" >nul
if !errorlevel! equ 0 (
    echo   [OK] Container si_tk_db sudah jalan.
) else (
    echo   [INFO] Container si_tk_db belum jalan, mencoba start...
    docker compose up -d >> "%LOG%" 2>&1
    if errorlevel 1 (
        echo [ERROR] Gagal start database via docker compose.
        echo Pastikan Docker Desktop sudah aktif ^(cek di system tray^).
        echo Lihat detail di %LOG%
        goto :end_error
    )
    echo   [OK] Container si_tk_db dijalankan. Tunggu 3 detik...
    ping -n 4 127.0.0.1 >nul
)

:: 7. Cek port
echo [7/7] Cek port 8000 ^& 5173...
netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul
if !errorlevel! equ 0 (
    echo   [WARNING] Port 8000 sudah dipakai. PHP server kemungkinan gagal start.
)
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if !errorlevel! equ 0 (
    echo   [WARNING] Port 5173 sudah dipakai. Vite kemungkinan gagal start.
)
echo   [OK] Cek port selesai.

echo.
echo ============================================================
echo   Menjalankan PHP server + Vite dev server...
echo   - URL Aplikasi : http://localhost:8000
echo   - Dev Login    : http://localhost:8000/login2
echo   - Vite HMR     : http://localhost:5173
echo.
echo   Tekan Ctrl+C untuk berhenti.
echo ============================================================
echo.

:: Jalankan kedua server di jendela INI (tidak spawn jendela baru)
:: lewat npm run start (concurrently). Output PHP+Vite akan tampil
:: dengan prefix [PHP] dan [VITE].
call npm run start

echo.
echo ============================================================
echo  Server sudah berhenti.
echo ============================================================
goto :end_pause

:end_error
echo.
echo ============================================================
echo  TERJADI ERROR. Cek file: %CD%\%LOG%
echo ============================================================

:end_pause
echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
endlocal
