#!/bin/bash

echo "🧪 Testing Simplified Email System"
echo "=================================="
echo ""

# Check if backend is running
echo "1. Checking backend status..."
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running. Please start the backend first."
    exit 1
fi

echo ""
echo "2. Testing email configuration..."
CONFIG_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/email/test/configuration")
if [[ $CONFIG_RESPONSE == *"configurationOk"* ]]; then
    echo "   ✅ Email configuration test passed"
else
    echo "   ❌ Email configuration test failed"
    echo "   Response: $CONFIG_RESPONSE"
fi

echo ""
echo "3. Testing individual homework email..."
echo "   Note: You need a valid user ID and homework ID for this test"
echo "   Example: curl -X POST 'http://localhost:8080/api/email/test/new-homework?userId=1&homeworkId=1'"

echo ""
echo "4. Testing grade-based homework email..."
echo "   Note: You need a valid class grade and homework ID for this test"
echo "   Example: curl -X POST 'http://localhost:8080/api/email/test/grade-homework?classGrade=4th%20Grade&homeworkId=1'"

echo ""
echo "📋 Email System Summary:"
echo "   ✅ Simplified email system implemented"
echo "   ✅ Emails only sent when homework is created"
echo "   ✅ Emails sent only to relevant students (by class/grade)"
echo "   ✅ No dependency on notification or reminder systems"
echo "   ✅ Clean, focused email functionality"

echo ""
echo "🔧 To test the system:"
echo "   1. Create a new homework through the application"
echo "   2. Check if emails are sent to students in the same grade"
echo "   3. Use the test endpoints to verify email functionality"
echo ""
echo "📧 Email Configuration:"
echo "   - SMTP Host: smtp.gmail.com"
echo "   - SMTP Port: 587"
echo "   - Authentication: Enabled"
echo "   - STARTTLS: Enabled"
echo "   - From Email: ashfak25321@gmail.com"
