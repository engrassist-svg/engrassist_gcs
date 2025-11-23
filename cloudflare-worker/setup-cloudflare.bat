@echo off
echo ============================================
echo EngrAssist Cloudflare Setup Script
echo ============================================
echo.

REM Ask for the API token
echo Please paste your Cloudflare API token and press Enter:
set /p API_TOKEN=

echo.
echo Setting up Cloudflare authentication...
setx CLOUDFLARE_API_TOKEN "%API_TOKEN%"
set CLOUDFLARE_API_TOKEN=%API_TOKEN%

echo.
echo Testing authentication...
wrangler whoami
if errorlevel 1 (
    echo.
    echo ERROR: Authentication failed. Please check your token and try again.
    pause
    exit /b 1
)

echo.
echo ============================================
echo Authentication successful!
echo Creating D1 database...
echo ============================================
echo.

cd /d "%~dp0"
wrangler d1 create engrassist-db > db-output.txt 2>&1

echo.
echo Extracting database ID...
for /f "tokens=3" %%i in ('findstr "database_id" db-output.txt') do set DB_ID=%%i
set DB_ID=%DB_ID:"=%

if "%DB_ID%"=="" (
    echo ERROR: Could not create database. Output:
    type db-output.txt
    pause
    exit /b 1
)

echo Database created with ID: %DB_ID%
echo.

echo Updating wrangler.toml with database ID...
powershell -Command "(Get-Content wrangler.toml) -replace 'database_id = \"YOUR_DATABASE_ID\"', 'database_id = \"%DB_ID%\"' | Set-Content wrangler.toml"

echo.
echo ============================================
echo Initializing database schema...
echo ============================================
echo.

wrangler d1 execute engrassist-db --file=schema.sql

echo.
echo ============================================
echo Setting up JWT secret...
echo ============================================
echo.

REM Generate a random JWT secret
set JWT_SECRET=%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%

echo %JWT_SECRET% | wrangler secret put JWT_SECRET

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Your Cloudflare backend is ready!
echo.
echo Next steps:
echo 1. Test locally: wrangler dev
echo 2. Deploy to production: wrangler deploy
echo.
echo Press any key to exit...
pause > nul
