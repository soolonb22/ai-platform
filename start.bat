@echo off
cd /d "%~dp0"
echo Running from: %CD%
if not exist package.json (
  echo package.json not found in this folder.
  echo Move this file into the folder that contains package.json.
  pause
  exit /b 1
)
call npm install
if errorlevel 1 pause & exit /b 1
call npm test
if errorlevel 1 pause & exit /b 1
call npm run build
if errorlevel 1 pause & exit /b 1
call npx vite
pause
