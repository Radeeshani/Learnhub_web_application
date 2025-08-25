@echo off
REM EduBuddy Startup Script for Windows
REM This script starts both the backend and frontend services

echo 🚀 Starting EduBuddy...

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java is not installed or not in PATH
    echo Please install Java 17 or higher and add it to your PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 16 or higher and add it to your PATH
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven is not installed or not in PATH
    echo Please install Maven 3.6 or higher and add it to your PATH
    pause
    exit /b 1
)

echo 🔍 Checking port availability...

REM Check if port 8080 is available
netstat -an | find "8080" >nul 2>&1
if not errorlevel 1 (
    echo ❌ Port 8080 is already in use. Please stop the service using that port first.
    pause
    exit /b 1
)

REM Check if port 5173 is available
netstat -an | find "5173" >nul 2>&1
if not errorlevel 1 (
    echo ❌ Port 5173 is already in use. Please stop the service using that port first.
    pause
    exit /b 1
)

REM Start backend
echo 🔧 Starting Backend (Spring Boot)...
cd backend

REM Compile if needed
if not exist "target\classes" (
    echo 📦 Compiling backend...
    mvn clean compile
)

REM Start backend in background
echo 🚀 Starting backend server on port 8080...
start "Backend Server" cmd /c "mvn spring-boot:run > ..\backend.log 2>&1"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

REM Check if backend is running
curl -s http://localhost:8080/api/actuator/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend failed to start. Check backend.log for details.
    pause
    exit /b 1
) else (
    echo ✅ Backend is running successfully!
)

REM Start frontend
echo 🎨 Starting Frontend (React)...
cd ..\frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Start frontend in background
echo 🚀 Starting frontend server on port 5173...
start "Frontend Server" cmd /c "npm run dev > ..\frontend.log 2>&1"

REM Wait for frontend to start
echo ⏳ Waiting for frontend to start...
timeout /t 10 /nobreak >nul

REM Check if frontend is running
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend failed to start. Check frontend.log for details.
    pause
    exit /b 1
) else (
    echo ✅ Frontend is running successfully!
)

echo.
echo 🎉 EduBuddy is now running!
echo.
echo 📍 Backend: http://localhost:8080/api
echo 📍 Frontend: http://localhost:5173
echo.
echo 👥 Demo Users:
echo    Admin: admin@homework.com / admin123
echo    Teacher: teacher@homework.com / teacher123
echo    Student: student@homework.com / student123
echo    Parent: parent@homework.com / parent123
echo.
echo 📝 Logs:
echo    Backend: backend.log
echo    Frontend: frontend.log
echo.
echo 🛑 To stop the application, close the command windows or press Ctrl+C in each window
echo.
pause
