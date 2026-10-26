@echo off
rem Double-click to run the DEVELOPMENT version (for editing the code).
rem Note: in development each page is compiled the first time you open it,
rem so first clicks take several seconds. To show the client, use start-website.cmd.
cd /d "%~dp0"
start "" http://localhost:3000
call npm.cmd run dev
pause
