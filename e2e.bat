@echo off
setlocal enabledelayedexpansion
rem Runs the browser (Playwright) tests: sign up -> menu -> order -> admin sees the order.
rem Uses a fake API, so nothing touches the live site. Results are saved to e2e-log.txt.
cd /d "%~dp0"
echo Running browser tests... (first run downloads Chromium, this can take a few minutes)
(
  echo === npm install ===
  call npm install
  echo === install Playwright test runner ^(not saved to package.json^) ===
  call npm install --no-save @playwright/test
  echo === install Chromium ===
  call npx playwright install chromium
  echo === e2e ===
  call npx playwright test
  echo E2E_EXIT=!errorlevel!
) > e2e-log.txt 2>&1
type e2e-log.txt
echo.
echo Done. E2E_EXIT=0 means passed.
pause
