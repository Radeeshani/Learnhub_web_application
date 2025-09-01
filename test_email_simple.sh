#!/bin/bash

echo "🧪🧪🧪 SIMPLE EMAIL SYSTEM TEST 🧪🧪🧪"
echo "======================================"
echo ""

echo "1. Testing if backend is running..."
if curl -s http://localhost:8080/api/email/test/configuration > /dev/null; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running"
    echo "   Please start the backend first with: cd backend && mvn spring-boot:run"
    exit 1
fi

echo ""
echo "2. Testing basic email configuration..."
CONFIG_RESPONSE=$(curl -s http://localhost:8080/api/email/test/configuration)
echo "   Response: $CONFIG_RESPONSE"

echo ""
echo "3. Testing direct email sending..."
EMAIL_RESPONSE=$(curl -s http://localhost:8080/api/email/test/direct-email)
echo "   Response: $EMAIL_RESPONSE"

echo ""
echo "4. Testing comprehensive email logic..."
COMPREHENSIVE_RESPONSE=$(curl -s http://localhost:8080/api/email/test/email-logic-comprehensive)
echo "   Response: $COMPREHENSIVE_RESPONSE"

echo ""
echo "🎯 NEXT STEPS:"
echo "   1. Check your email (ashfak25321@gmail.com) for test emails"
echo "   2. If you received emails, the email system is working!"
echo "   3. If no emails, check the backend console for error messages"
echo "   4. Try creating a homework via the frontend to test the full flow"
echo ""
echo "🧪🧪🧪 TEST COMPLETED 🧪🧪🧪"
