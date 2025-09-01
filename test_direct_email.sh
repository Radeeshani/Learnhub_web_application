#!/bin/bash

echo "🧪 Testing Direct Email Logic"
echo "============================="
echo ""

echo "1. Testing individual email to a student..."
INDIVIDUAL_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/email/test/new-homework?userId=9&homeworkId=33")
echo "   Response: $INDIVIDUAL_RESPONSE"

echo ""
echo "2. Checking if homework 33 exists..."
mysql -u root -p12345678 -e "USE homework_db; SELECT id, title, class_grade FROM homeworks WHERE id = 33;" 2>/dev/null

echo ""
echo "3. Checking if student 9 exists..."
mysql -u root -p12345678 -e "USE homework_db; SELECT id, email, first_name, last_name, class_grade FROM users WHERE id = 9;" 2>/dev/null

echo ""
echo "4. Expected behavior:"
echo "   - Individual email should work (bypasses our new logic)"
echo "   - If this works but homework creation doesn't, our new logic isn't running"
echo "   - Check backend console for email-related logs"

echo ""
echo "🔧 Next Steps:"
echo "   1. Check backend console for our new log messages"
echo "   2. Look for any email sending errors"
echo "   3. Verify that the backend is actually running our updated code"
