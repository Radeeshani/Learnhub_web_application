#!/bin/bash

echo "🔄 Restarting Backend with Clean Compilation"
echo "============================================="
echo ""

echo "1. Stopping any running backend processes..."
pkill -f "com.homework.HomeworkApplication" 2>/dev/null
sleep 2

echo "2. Cleaning previous builds..."
cd backend
mvn clean -q

echo "3. Compiling fresh code..."
mvn compile -q

echo "4. Starting backend..."
echo "   Note: This will start the backend in the foreground"
echo "   Press Ctrl+C to stop it when needed"
echo ""

mvn spring-boot:run

