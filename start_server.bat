@echo off
cd /d "C:\Users\Kim\OneDrive\Desktop\church_website\backEnd"
start /B node src/server.js > "src\.runtime\server.log" 2>&1
