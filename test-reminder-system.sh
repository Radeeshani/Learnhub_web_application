#!/bin/bash

echo "🧪 Testing Reminder System Endpoints"
echo "====================================="

# Test the test endpoint first
echo "1. Testing basic reminder endpoint..."
curl -s "http://localhost:8080/api/reminders/test"
echo -e "\n"

# Test with a valid JWT token (you'll need to get this from login)
echo "2. Testing reminder endpoints with authentication..."
echo "Note: You need to be logged in to test these endpoints"
echo ""

echo "3. To test the full system:"
echo "   - Login to the application"
echo "   - Navigate to /reminders"
echo "   - Check the browser console for any errors"
echo "   - Verify that reminders are displayed"
echo ""

echo "4. Backend Status:"
if curl -s "http://localhost:8080/api/actuator/health" > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running"
fi

echo ""
echo "5. Database Status:"
echo "   - Reminders table should contain processed reminders"
echo "   - Notifications table should contain REMINDER type notifications"
echo ""

echo "6. Check the logs:"
echo "   - Backend logs should show scheduled task execution"
echo "   - Look for 'Processed X pending reminders' messages"
echo ""

echo "🎯 Reminder System Test Complete!"
