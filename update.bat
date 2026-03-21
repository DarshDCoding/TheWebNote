@echo off
setlocal EnableDelayedExpansion

:: ============================================================
::  TheWebNote — Update Script (Windows)
::  Copies new extension files into your existing TheWebNote
::  folder so Chrome keeps the same extension ID and your
::  notes are never lost.
:: ============================================================

title TheWebNote Updater

echo.
echo  =============================================
echo   TheWebNote Updater
echo  =============================================
echo.

:: ── Step 1: Locate the NEW files (same folder as this script) ──────────────

set "SCRIPT_DIR=%~dp0"
:: Remove trailing backslash
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: Verify this looks like a TheWebNote release folder
if not exist "%SCRIPT_DIR%\manifest.json" (
    echo  [ERROR] manifest.json not found next to this script.
    echo  Make sure update.bat is inside the extracted TheWebNote folder.
    echo.
    pause
    exit /b 1
)

echo  [OK] New version files found at:
echo       %SCRIPT_DIR%
echo.

:: ── Step 2: Auto-search for the existing installed folder ──────────────────

echo  Searching for your existing TheWebNote installation...
echo.

set "FOUND_PATH="
set "FOUND_COUNT=0"
set "TARGET_FOLDER=TheWebNote"

:: List of locations to search (all common places a user might have extracted)
set "SEARCH_ROOTS[0]=%USERPROFILE%\Desktop"
set "SEARCH_ROOTS[1]=%USERPROFILE%\Downloads"
set "SEARCH_ROOTS[2]=%USERPROFILE%\Documents"
set "SEARCH_ROOTS[3]=%USERPROFILE%\OneDrive\Desktop"
set "SEARCH_ROOTS[4]=%USERPROFILE%\OneDrive\Documents"
set "SEARCH_ROOTS[5]=%PUBLIC%\Desktop"
set "SEARCH_ROOTS[6]=C:\Extensions"
set "SEARCH_ROOTS[7]=%USERPROFILE%"

:: Collect all matches
set "MATCH_0="
set "MATCH_1="
set "MATCH_2="
set "MATCH_3="
set "MATCH_4="
set "MATCH_5="
set "MATCH_6="
set "MATCH_7="
set "MATCH_8="
set "MATCH_9="

for /L %%i in (0,1,7) do (
    if defined SEARCH_ROOTS[%%i] (
        set "ROOT=!SEARCH_ROOTS[%%i]!"
        set "CANDIDATE=!ROOT!\%TARGET_FOLDER%"

        if exist "!CANDIDATE!\manifest.json" (
            :: Make sure it is not the same folder as this script
            if /I not "!CANDIDATE!"=="%SCRIPT_DIR%" (
                set "MATCH_!FOUND_COUNT!=!CANDIDATE!"
                set /a FOUND_COUNT+=1
                echo  [FOUND] !CANDIDATE!
            )
        )
    )
)

echo.

:: ── Step 3: Decide what to do based on how many matches were found ─────────

:: No matches found — ask user
if %FOUND_COUNT%==0 (
    echo  [!] Could not automatically find your TheWebNote folder.
    echo.
    echo  Please paste the full path to your existing TheWebNote folder.
    echo  Example: C:\Users\John\Desktop\TheWebNote
    echo.
    set /p "FOUND_PATH=  Path: "
    echo.

    if not defined FOUND_PATH (
        echo  [ERROR] No path entered. Exiting.
        pause
        exit /b 1
    )

    :: Trim quotes if user pasted them
    set "FOUND_PATH=!FOUND_PATH:"=!"

    if not exist "!FOUND_PATH!\manifest.json" (
        echo  [ERROR] No manifest.json found at: !FOUND_PATH!
        echo  Make sure you are pointing to the correct TheWebNote folder.
        echo.
        pause
        exit /b 1
    )

    goto :do_update
)

:: Exactly one match — use it automatically
if %FOUND_COUNT%==1 (
    set "FOUND_PATH=%MATCH_0%"
    echo  [OK] Found exactly one installation. Using it automatically.
    echo       %FOUND_PATH%
    echo.
    goto :confirm
)

:: Multiple matches — ask user to pick
echo  [!] Found %FOUND_COUNT% TheWebNote folders. Which one is loaded in Chrome?
echo.
for /L %%i in (0,1,9) do (
    if defined MATCH_%%i (
        set /a DISPLAY=%%i+1
        echo    [!DISPLAY!] !MATCH_%%i!
    )
)
echo.
set /p "PICK=  Enter number (1-%FOUND_COUNT%): "

:: Validate pick
if not defined PICK (
    echo  [ERROR] No selection made. Exiting.
    pause
    exit /b 1
)

:: Map pick to path
set /a PICK_IDX=%PICK%-1
if !PICK_IDX! LSS 0 (
    echo  [ERROR] Invalid selection.
    pause
    exit /b 1
)
if !PICK_IDX! GEQ %FOUND_COUNT% (
    echo  [ERROR] Invalid selection.
    pause
    exit /b 1
)

set "FOUND_PATH=!MATCH_%PICK_IDX%!"
echo.
echo  [OK] Using: %FOUND_PATH%
echo.

:: ── Step 4: Confirm before overwriting ────────────────────────────────────

:confirm
echo  -----------------------------------------------
echo   Ready to update:
echo     FROM: %SCRIPT_DIR%
echo     TO:   %FOUND_PATH%
echo  -----------------------------------------------
echo.
echo  Your notes stored in Chrome will NOT be affected.
echo  Only the extension code files will be replaced.
echo.
set /p "CONFIRM=  Proceed? (Y/N): "
echo.

if /I not "%CONFIRM%"=="Y" (
    echo  Update cancelled. No files were changed.
    echo.
    pause
    exit /b 0
)

:: ── Step 5: Run the update ─────────────────────────────────────────────────

:do_update
echo  Updating files...
echo.

:: Use robocopy for reliable recursive copy with overwrite
:: /E   = include subdirectories (even empty)
:: /IS  = overwrite same files
:: /IT  = overwrite tweaked files
:: /NFL = no file list (cleaner output)
:: /NDL = no dir list
:: /NJH = no job header
:: /NJS = no job summary
:: /NC  = no file classes
:: /XF update.bat /XF update.sh = don't overwrite the scripts themselves

robocopy "%SCRIPT_DIR%" "%FOUND_PATH%" /E /IS /IT /NFL /NDL /NJH /NJS /NC /XF "update.bat" /XF "update.sh"

:: Robocopy exit codes 0-7 are success (8+ are errors)
if %ERRORLEVEL% GEQ 8 (
    echo.
    echo  [ERROR] Something went wrong during the file copy.
    echo  Please try copying the files manually.
    echo.
    pause
    exit /b 1
)

:: ── Step 6: Done — instruct user to reload ────────────────────────────────

echo.
echo  =============================================
echo   Update complete!
echo  =============================================
echo.
echo  One last step — reload the extension in Chrome:
echo.
echo    1. Open Chrome and go to: chrome://extensions
echo    2. Find "The Web Note" in the list
echo    3. Click the reload icon (circular arrow)
echo.
echo  That's it! Your notes are safe and the new
echo  version is now active.
echo.
pause
exit /b 0