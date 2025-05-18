@echo off
echo Cleaning up ThePrintProject temporary files...

rem Clean temp print job files
echo Cleaning temporary print files...
FOR /D %%G IN ("%TEMP%\print-jobs\*") DO (
    echo Removing %%G
    rd /s /q "%%G"
)
del /q "%TEMP%\print-jobs\*" 2>nul

rem Clean any Electron temp files that might be leftover
echo Cleaning Electron cache...
rmdir /s /q "%APPDATA%\Gemini Property Dashboard\Cache" 2>nul
rmdir /s /q "%APPDATA%\Gemini Property Dashboard\Code Cache" 2>nul

echo Cleanup complete!
pause
