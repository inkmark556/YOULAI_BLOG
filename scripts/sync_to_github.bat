@echo off
echo ==========================================
echo      SYNCING BLOG CONTENT TO GITHUB
echo ==========================================
echo.

:: 1. Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    pause
    exit /b
)

:: 2. Add all changes (including new posts and images)
echo [1/3] Staging changes...
git add .

:: 3. Commit changes
echo [2/3] Committing changes...
set /p commit_msg="Enter commit message (default: Update blog content): "
if "%commit_msg%"=="" set commit_msg=Update blog content
git commit -m "%commit_msg%"

:: 4. Push to remote
echo [3/3] Pushing to GitHub...
git push

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Content synced to GitHub!
    echo Cloudflare Pages should start building shortly.
) else (
    echo.
    echo [ERROR] Failed to push to GitHub. Please check your connection or credentials.
)

pause
