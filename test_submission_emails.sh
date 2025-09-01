#!/bin/bash

echo "🧪🧪🧪 TESTING HOMEWORK SUBMISSION EMAILS 🧪🧪🧪"
echo "=================================================="

# Test 1: Check if backend is running
echo "🔍 Test 1: Checking if backend is running..."
if curl -s http://localhost:8080/api/email/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start the backend first."
    exit 1
fi

# Test 2: Test email configuration
echo ""
echo "🔍 Test 2: Testing email configuration..."
response=$(curl -s http://localhost:8080/api/email/test-config)
echo "Response: $response"

# Test 3: Check email health endpoint
echo ""
echo "🔍 Test 3: Checking email health endpoint..."
health_response=$(curl -s http://localhost:8080/api/email/health)
echo "Health Response: $health_response"

echo ""
echo "🎉🎉🎉 EMAIL SYSTEM TESTS COMPLETED! 🎉🎉🎉"
echo ""
echo "📧 To test the submission email functionality:"
echo "   1. Create a homework as a teacher"
echo "   2. Submit homework as a student"
echo "   3. Check if teacher receives email notification"
echo "   4. Grade the homework as a teacher"
echo "   5. Check if student receives graded notification email"
echo ""
echo "📝 Note: Make sure your email credentials are properly configured in application.yml"
echo ""
echo "🔍 Email Flow:"
echo "   Student submits homework → Teacher receives email"
echo "   Teacher grades homework → Student receives email"
