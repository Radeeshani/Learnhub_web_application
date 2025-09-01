#!/bin/bash

echo "🚨 AGGRESSIVE BACKEND RESTART"
echo "============================="
echo ""

echo "1. Stopping ALL Java processes related to homework..."
pkill -f "com.homework.HomeworkApplication" 2>/dev/null
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "HomeworkApplication" 2>/dev/null

echo "2. Waiting for processes to stop..."
sleep 5

echo "3. Force killing any remaining processes..."
pkill -9 -f "com.homework.HomeworkApplication" 2>/dev/null
pkill -9 -f "spring-boot:run" 2>/dev/null

echo "4. Checking if any processes remain..."
REMAINING=$(ps aux | grep java | grep -i homework | wc -l)
echo "   Remaining processes: $REMAINING"

if [ $REMAINING -gt 0 ]; then
    echo "   ⚠️  Force killing remaining processes..."
    ps aux | grep java | grep -i homework | awk '{print $2}' | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "5. Cleaning ALL previous builds..."
cd backend
mvn clean -q

echo "6. Removing target directory completely..."
rm -rf target/

echo "7. Compiling fresh code..."
mvn compile -q

echo "8. Verifying our code is compiled..."
if grep -a "STARTING EMAIL LOGIC" target/classes/com/homework/service/HomeworkService.class > /dev/null; then
    echo "   ✅ Our new code is compiled and ready"
else
    echo "   ❌ Our new code is NOT compiled!"
    exit 1
fi

echo ""
echo "9. Starting backend with clean compilation..."
echo "   Note: This will start the backend in the foreground"
echo "   Press Ctrl+C to stop it when needed"
echo ""

mvn spring-boot:run
