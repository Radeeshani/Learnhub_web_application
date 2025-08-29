#!/bin/bash

# LearnHub Startup Script
# This script starts both the backend and frontend services

echo "🚀 Starting LearnHub..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use. Please stop the service using that port first."
        return 1
    fi
    return 0
}

# Check if required ports are available
echo "🔍 Checking port availability..."
if ! check_port 8080; then
    exit 1
fi
if ! check_port 5173; then
    exit 1
fi

# Start backend
echo "🔧 Starting Backend (Spring Boot)..."
cd backend
if [ ! -f "target/classes" ]; then
    echo "📦 Compiling backend..."
    mvn clean compile
fi

# Start backend in background
echo "🚀 Starting backend server on port 8080..."
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Check if backend is running
if curl -s http://localhost:8080/api/actuator/health > /dev/null; then
    echo "✅ Backend is running successfully!"
else
    echo "❌ Backend failed to start. Check backend.log for details."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🎨 Starting Frontend (React)..."
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting frontend server on port 5173..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running successfully!"
else
    echo "❌ Frontend failed to start. Check frontend.log for details."
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 LearnHub is now running!"
echo ""
echo "📍 Backend: http://localhost:8080/api"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "👥 Demo Users:"
echo "   Admin: admin@homework.com / admin123"
echo "   Teacher: teacher@homework.com / teacher123"
echo "   Student: student@homework.com / student123"
echo "   Parent: parent@homework.com / parent123"
echo ""
echo "📝 Logs:"
echo "   Backend: backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "🛑 To stop the application, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping LearnHub..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Application stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait
