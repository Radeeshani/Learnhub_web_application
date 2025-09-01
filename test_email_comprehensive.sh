#!/bin/bash

echo "🔍 Comprehensive Email System Test"
echo "=================================="
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
echo "3. Database Check - Current State:"
echo "   Students with '4th Grade':"
mysql -u root -p12345678 -e "USE homework_db; SELECT COUNT(*) as count FROM users WHERE class_grade = '4th Grade' AND role = 'STUDENT';" 2>/dev/null

echo "   Students with 'Grade 4':"
mysql -u root -p12345678 -e "USE homework_db; SELECT COUNT(*) as count FROM users WHERE class_grade = 'Grade 4' AND role = 'STUDENT';" 2>/dev/null

echo "   Recent homework:"
mysql -u root -p12345678 -e "USE homework_db; SELECT id, title, class_grade, subject FROM homeworks ORDER BY id DESC LIMIT 3;" 2>/dev/null

echo ""
echo "4. Testing Email Logic:"
echo "   Testing with 'Grade 4' format (should find students with '4th Grade'):"
GRADE4_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/email/test/grade-homework?classGrade=Grade%204&homeworkId=29")
echo "   Response: $GRADE4_RESPONSE"

echo ""
echo "   Testing with '4th Grade' format (direct match):"
GRADE4TH_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/email/test/grade-homework?classGrade=4th%20Grade&homeworkId=29")
echo "   Response: $GRADE4TH_RESPONSE"

echo ""
echo "5. Testing Individual Email:"
echo "   Testing individual email to a specific student:"
INDIVIDUAL_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/email/test/new-homework?userId=9&homeworkId=29")
echo "   Response: $INDIVIDUAL_RESPONSE"

echo ""
echo "6. Checking for Email Errors:"
echo "   If emails are not being sent, possible issues:"
echo "   - Backend not restarted with new logic"
echo "   - Email service configuration issues"
echo "   - Class grade conversion logic not working"
echo "   - Silent failures in email sending"

echo ""
echo "🔧 Next Steps:"
echo "   1. Check if backend console shows any email-related errors"
echo "   2. Verify that new homework creation triggers email logic"
echo "   3. Check if class grade conversion is working"
echo "   4. Ensure email service is properly configured"
