#!/bin/bash

echo "🔍 Debugging Email System"
echo "========================="
echo ""

# Check backend status
echo "1. Checking backend status..."
if curl -s http://localhost:8080/api/email/test/configuration > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is not running"
    exit 1
fi

echo ""
echo "2. Testing email configuration..."
CONFIG_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/email/test/configuration")
echo "   Response: $CONFIG_RESPONSE"

echo ""
echo "3. Testing with different class grade formats..."

echo "   Testing 'Grade 4' format..."
GRADE4_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/email/test/grade-homework?classGrade=Grade%204&homeworkId=28")
echo "   Response: $GRADE4_RESPONSE"

echo ""
echo "   Testing '4th Grade' format..."
GRADE4TH_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/email/test/grade-homework?classGrade=4th%20Grade&homeworkId=28")
echo "   Response: $GRADE4TH_RESPONSE"

echo ""
echo "4. Database Check - Students by Grade:"
echo "   Students with '4th Grade':"
mysql -u root -p12345678 -e "USE homework_db; SELECT id, email, first_name, last_name, class_grade FROM users WHERE class_grade = '4th Grade' AND role = 'STUDENT';" 2>/dev/null

echo ""
echo "   Students with 'Grade 4':"
mysql -u root -p12345678 -e "USE homework_db; SELECT id, email, first_name, last_name, class_grade FROM users WHERE class_grade = 'Grade 4' AND role = 'STUDENT';" 2>/dev/null

echo ""
echo "5. Homework Check:"
echo "   Recent homework with class grades:"
mysql -u root -p12345678 -e "USE homework_db; SELECT id, title, class_grade, subject FROM homeworks ORDER BY id DESC LIMIT 5;" 2>/dev/null

echo ""
echo "🔧 Debug Summary:"
echo "   - If 'Grade 4' returns 'No students found' but '4th Grade' works,"
echo "     the class grade format mismatch is the issue"
echo "   - The backend needs to be restarted to pick up our new logic"
echo "   - Check the logs for any email-related errors"
