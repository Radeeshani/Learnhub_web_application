#!/bin/bash

echo "🔄 FORCING COMPLETE BACKEND RESTART"
echo "==================================="
echo ""

echo "1. Stopping ALL backend processes..."
pkill -f "com.homework.HomeworkApplication" 2>/dev/null
pkill -f "spring-boot:run" 2>/dev/null
sleep 3

echo "2. Checking if any processes remain..."
REMAINING=$(ps aux | grep java | grep homework | wc -l)
if [ $REMAINING -gt 0 ]; then
    echo "   ⚠️  Some processes still running, force killing..."
    pkill -9 -f "com.homework.HomeworkApplication" 2>/dev/null
    sleep 2
fi

echo "3. Cleaning previous builds..."
cd backend
mvn clean -q

echo "4. Compiling fresh code..."
mvn compile -q

echo "5. Starting backend with clean compilation..."
echo "   Note: This will start the backend in the foreground"
echo "   Press Ctrl+C to stop it when needed"
echo ""

mvn spring-boot:run
