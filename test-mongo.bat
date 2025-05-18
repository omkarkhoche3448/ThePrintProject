@echo off
echo Testing MongoDB connection handling...
cd %~dp0electron-app
node electron\test-mongo-connection.cjs
pause
