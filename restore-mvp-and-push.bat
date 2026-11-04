@echo off
setlocal
rem Puts the MVP version of the site (this folder) on GitHub, on top of the
rem "demo UI" commits that were pushed from another computer.
rem Nothing is lost: both versions are kept as backup branches.
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo Git was not found.
  pause
  exit /b 1
)

echo Downloading the latest commits from GitHub...
git fetch origin
if errorlevel 1 goto fail

rem Backups: your local MVP commit and the demo UI from GitHub
git branch -f backup-mvp-local HEAD
git branch -f backup-demo-ui origin/main
echo Backups saved: branches backup-mvp-local and backup-demo-ui

rem Move onto GitHub's latest commit but keep this folder's files exactly as they are
git reset --soft origin/main
if errorlevel 1 goto fail
git add -A

git diff --cached --name-only | findstr /r /c:"^\.env$" /c:"/\.env$" >nul
if not errorlevel 1 (
  echo STOP: a .env file is staged. It must never be pushed.
  pause
  exit /b 1
)

set MSG=%TEMP%\bb-restore-msg.txt
> "%MSG%" echo Restore the MVP site and keep the new brand red
>> "%MSG%" echo.
>> "%MSG%" echo Brings back the MVP sign up, sign in, checkout and admin panel, free
>> "%MSG%" echo delivery without time slots, and removes the demo account buttons.
>> "%MSG%" echo The demo UI is kept in the backup-demo-ui branch.
>> "%MSG%" echo.
>> "%MSG%" echo Co-Authored-By: Claude Opus 5.5 ^<noreply@anthropic.com^>
>> "%MSG%" echo Claude-Session: https://claude.ai/code/session_01CrRG58Af2UMDYkeYXdcL1u
git commit -q -F "%MSG%"
if errorlevel 1 goto fail
del "%MSG%" >nul 2>nul

echo.
echo Uploading to GitHub...
git push origin main
if errorlevel 1 goto fail

echo.
echo DONE. The MVP site is on GitHub. Netlify will update in about a minute.
pause
exit /b 0

:fail
echo.
echo SOMETHING FAILED. Read the message above. Nothing was deleted.
pause
exit /b 1
