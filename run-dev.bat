@echo off
title Banglar Biriyani - dev server
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Download it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing packages, this takes a minute the first time...
  call npm install
)

echo Starting the site at http://localhost:5173
call npm run dev
pause
