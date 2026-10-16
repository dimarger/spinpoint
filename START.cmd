@echo off
setlocal
cd /d "%~dp0"
set "npm_config_script_shell=%ComSpec%"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org/ and run START.cmd again.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Installing SpinPoint dependencies. Internet access is required.
  call npm ci
  if errorlevel 1 goto fail
)
echo Starting SpinPoint. Keep this window open while using the store.
call npm run dev -- --open
if errorlevel 1 goto fail
exit /b 0
:fail
echo SpinPoint could not start. Copy the error above to the project chat.
pause
exit /b 1
