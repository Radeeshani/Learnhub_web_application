#!/bin/bash

echo "🧪 Testing Complete Homework Creation with Email Flow"
echo "=================================================="
echo ""

# Step 1: Get a teacher token (login)
echo "1. Getting teacher authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@homework.com","password":"teacher123"}')

echo "   Login response: $LOGIN_RESPONSE"

# Extract token from response (assuming it's in format {"token":"...","...":"..."})
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "   ❌ Failed to get authentication token"
    echo "   Trying with a different teacher..."
    
    LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"ayazm9582@gmail.com","password":"654321"}')
    
    echo "   Second login response: $LOGIN_RESPONSE"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "   ❌ Still failed to get authentication token, exiting"
    exit 1
fi

echo "   ✅ Got authentication token: ${TOKEN:0:20}..."
echo ""

# Step 2: Create homework with proper authentication
echo "2. Creating homework with authentication..."

HOMEWORK_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/homework" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Email Test Homework $(date +%Y%m%d-%H%M%S)" \
  -F "description=Testing if emails are sent when homework is created" \
  -F "subject=Test Subject" \
  -F "grade=4" \
  -F "classGrade=4th Grade" \
  -F "classId=1" \
  -F "dueDate=2025-09-07T23:59:59")

echo "   Homework creation response: $HOMEWORK_RESPONSE"
echo ""

# Step 3: Check if homework was created successfully
if echo "$HOMEWORK_RESPONSE" | grep -q "successfully"; then
    echo "   ✅ Homework created successfully"
    
    # Extract homework ID if possible
    HOMEWORK_ID=$(echo $HOMEWORK_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo "   📝 Homework ID: $HOMEWORK_ID"
    
    # Step 4: Test email with the newly created homework
    if [ ! -z "$HOMEWORK_ID" ]; then
        echo ""
        echo "3. Testing email with newly created homework..."
        EMAIL_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/email/test/grade-homework?classGrade=4th%20Grade&homeworkId=$HOMEWORK_ID")
        echo "   Email test response: $EMAIL_RESPONSE"
    fi
else
    echo "   ❌ Homework creation failed"
fi

echo ""
echo "4. Checking database for the new homework..."
mysql -u root -p12345678 -e "USE homework_db; SELECT id, title, class_grade, created_at FROM homeworks ORDER BY id DESC LIMIT 3;" 2>/dev/null

echo ""
echo "5. Checking students in database..."
mysql -u root -p12345678 -e "USE homework_db; SELECT id, email, first_name, last_name, class_grade FROM users WHERE role = 'STUDENT' AND class_grade = '4th Grade';" 2>/dev/null

echo ""
echo "🔍 Summary:"
echo "   - If homework was created but no email was sent, there's an issue in the email logic"
echo "   - If homework creation failed, there's an issue with authentication or validation"
echo "   - Check the backend logs for any errors during homework creation"
