@echo off
setlocal
title MealMate - Smart Campus Food Delivery Platform

echo ========================================================
echo   MEALMATE - SMART CAMPUS FOOD DELIVERY PLATFORM
echo ========================================================
echo.

:: Check for Bun
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Detected Bun runtime.
    if not exist node_modules (
        echo Installing dependencies using Bun...
        bun install
    )
    echo Starting MySQL REST API Backend + Vite Frontend with Bun...
    echo.
    bun run dev
    goto :end
)

:: Check for npm / Node
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Detected Node.js / npm environment.
    if not exist node_modules (
        echo Installing dependencies using npm...
        npm install
    )
    echo Starting application with npm...
    echo.
    npm run dev
    goto :end
)

echo [ERROR] Neither Bun nor Node.js was found in your PATH.
echo Please install Bun (https://bun.sh) or Node.js (https://nodejs.org).
echo.
pause

:end
endlocal
