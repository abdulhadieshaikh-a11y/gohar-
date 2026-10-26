@echo off
rem Double-click to run the FAST production version of the Gohar website
rem on http://localhost:3000 (use this to show the client).
rem It builds the site first (about 1 minute), then every click opens in well under a second.
rem Uses npm.cmd, so it works even when PowerShell scripts are blocked.
cd /d "%~dp0"
echo.
echo  Building the Gohar website (about 1 minute)...
echo.
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo  Build failed - see the messages above.
  pause
  exit /b 1
)
echo.
echo  Starting... opening http://localhost:3000
start "" http://localhost:3000
call npm.cmd start
pause
