@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 Homework Application Setup Script for New PC
echo ==============================================
echo.

:: Step 1: Check prerequisites
echo [INFO] Checking prerequisites...

:: Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found. Please install Java 17 or higher
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)
echo [SUCCESS] Java found

:: Check Maven
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven not found. Please install Maven 3.6+
    echo Download from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo [SUCCESS] Maven found

:: Check MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MySQL client not found. Please install MySQL 8.0+
    echo Download from: https://dev.mysql.com/downloads/mysql/
)

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 16+
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo [SUCCESS] Node.js found

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found. Please install npm
    pause
    exit /b 1
)
echo [SUCCESS] npm found

echo.

:: Step 2: Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "uploads\homework" mkdir "uploads\homework"
if not exist "uploads\profile-pictures" mkdir "uploads\profile-pictures"
echo [SUCCESS] Directories created

:: Step 3: Database setup
echo [INFO] Setting up database...
echo Please create the database manually:
echo 1. Open MySQL Workbench or command line
echo 2. Run: CREATE DATABASE homework_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo 3. Run: mysql -u root -p homework_db ^< database\setup_complete_database.sql

echo.

:: Step 4: Backend setup
echo [INFO] Setting up backend...
cd backend

if exist "src\main\resources\application.yml" (
    echo [INFO] Configuring application.yml...
    
    :: Backup original file
    copy "src\main\resources\application.yml" "src\main\resources\application.yml.backup" >nul
    
    :: Ask for database password
    echo.
    set /p MYSQL_PASSWORD="Enter your MySQL root password: "
    
    :: Update database configuration (Windows-compatible sed replacement)
    powershell -Command "(Get-Content 'src\main\resources\application.yml') -replace 'password: 12345678', 'password: %MYSQL_PASSWORD%' | Set-Content 'src\main\resources\application.yml'"
    
    echo [SUCCESS] Database configuration updated
    
    :: Ask for email configuration
    echo.
    set /p EMAIL_ADDRESS="Enter your Gmail address (or press Enter to skip): "
    if not "!EMAIL_ADDRESS!"=="" (
        set /p EMAIL_PASSWORD="Enter your Gmail App Password: "
        
        :: Update email configuration
        powershell -Command "(Get-Content 'src\main\resources\application.yml') -replace 'ashfak25321@gmail.com', '!EMAIL_ADDRESS!' | Set-Content 'src\main\resources\application.yml'"
        powershell -Command "(Get-Content 'src\main\resources\application.yml') -replace 'aahy bavj ftvf dtqh', '!EMAIL_PASSWORD!' | Set-Content 'src\main\resources\application.yml'"
        
        echo [SUCCESS] Email configuration updated
    )
) else (
    echo [ERROR] application.yml not found in backend\src\main\resources\
)

cd ..

echo.

:: Step 5: Frontend setup
echo [INFO] Setting up frontend...
cd frontend

if exist "package.json" (
    echo [INFO] Installing frontend dependencies...
    call npm install
    if %errorlevel% equ 0 (
        echo [SUCCESS] Frontend dependencies installed
    ) else (
        echo [ERROR] Failed to install frontend dependencies
    )
) else (
    echo [ERROR] package.json not found in frontend directory
)

cd ..

echo.

:: Step 6: Final instructions
echo [SUCCESS] Setup completed!
echo.
echo 📋 Next steps:
echo 1. Start MySQL service from Services or MySQL Installer
echo 2. Start backend: cd backend ^&^& mvn spring-boot:run
echo 3. Start frontend (new command prompt): cd frontend ^&^& npm run dev
echo 4. Test the system: run test_email_system_fixed.sh
echo.
echo 📚 For detailed instructions, see: SETUP_GUIDE_COMPLETE.md
echo.
echo 🔧 If you encounter issues:
echo - Check the logs in backend.log
echo - Verify all services are running
echo - Ensure database is accessible
echo - Check email configuration
echo.
echo 🎉 Good luck with your Homework Application!
echo.
pause


