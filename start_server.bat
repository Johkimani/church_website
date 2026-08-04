@echo off
cd /d "%~dp0backEnd"
if not exist "src\.runtime" mkdir "src\.runtime"
start /B node src/server.js > "src\.runtime\server.log" 2>&1
echo Server started. Check src\.runtime\server.log for output.
