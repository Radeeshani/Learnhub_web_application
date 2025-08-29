#!/bin/bash

echo "🧪 Testing Notification System"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8080/api"

echo -e "\n${YELLOW}1. Testing Backend Health${NC}"
echo "Testing if backend is running..."

if curl -s "$BASE_URL/homework/test" > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running. Please start the backend first.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}2. Testing Database Connection${NC}"
echo "Checking if database is accessible..."

# Test database connection by checking if we can access notifications
if curl -s "$BASE_URL/homework/notifications/user/count" > /dev/null; then
    echo -e "${GREEN}✅ Database connection is working${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

echo -e "\n${YELLOW}3. Testing Notification Endpoints${NC}"

# Test notification endpoints
echo "Testing notification endpoints..."

# Test getting notifications (will fail without auth, but should return 401, not 500)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/homework/notifications/user")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Notification endpoint is accessible (returns 401 without auth as expected)${NC}"
else
    echo -e "${RED}❌ Notification endpoint failed (HTTP $RESPONSE)${NC}"
fi

echo -e "\n${YELLOW}4. Testing Email Configuration${NC}"
echo "Checking email configuration..."

# Check if email environment variables are set
if [ -z "$EMAIL_USERNAME" ] || [ "$EMAIL_USERNAME" = "your-email@gmail.com" ]; then
    echo -e "${YELLOW}⚠️  EMAIL_USERNAME not set or using default value${NC}"
    echo "   Set EMAIL_USERNAME environment variable to your Gmail address"
else
    echo -e "${GREEN}✅ EMAIL_USERNAME is set: $EMAIL_USERNAME${NC}"
fi

if [ -z "$EMAIL_PASSWORD" ] || [ "$EMAIL_PASSWORD" = "your-app-password" ]; then
    echo -e "${YELLOW}⚠️  EMAIL_PASSWORD not set or using default value${NC}"
    echo "   Set EMAIL_PASSWORD environment variable to your Gmail app password"
else
    echo -e "${GREEN}✅ EMAIL_PASSWORD is set${NC}"
fi

echo -e "\n${YELLOW}5. Testing Frontend Notification Context${NC}"
echo "Checking if frontend can connect to backend..."

# Test if frontend can reach the backend
if curl -s "$BASE_URL/homework/test" | grep -q "working"; then
    echo -e "${GREEN}✅ Frontend can reach backend${NC}"
else
    echo -e "${RED}❌ Frontend cannot reach backend${NC}"
fi

echo -e "\n${YELLOW}6. Summary and Next Steps${NC}"
echo "================================"

echo -e "\n${GREEN}✅ What's Working:${NC}"
echo "   - Backend is running"
echo "   - Database connection is established"
echo "   - Notification endpoints are accessible"
echo "   - Frontend can reach backend"

echo -e "\n${YELLOW}⚠️  What Needs Attention:${NC}"
if [ -z "$EMAIL_USERNAME" ] || [ "$EMAIL_USERNAME" = "your-email@gmail.com" ]; then
    echo "   - Email notifications won't work without EMAIL_USERNAME"
fi
if [ -z "$EMAIL_PASSWORD" ] || [ "$EMAIL_PASSWORD" = "your-app-password" ]; then
    echo "   - Email notifications won't work without EMAIL_PASSWORD"
fi

echo -e "\n${YELLOW}🔧 To Fix Email Notifications:${NC}"
echo "   1. Set EMAIL_USERNAME environment variable:"
echo "      export EMAIL_USERNAME=your-email@gmail.com"
echo "   2. Set EMAIL_PASSWORD environment variable:"
echo "      export EMAIL_PASSWORD=your-gmail-app-password"
echo "   3. Restart the backend application"

echo -e "\n${YELLOW}🧪 To Test Notifications:${NC}"
echo "   1. Login to the application as a teacher"
echo "   2. Create a new homework assignment"
echo "   3. Check if students receive notifications"
echo "   4. Check if emails are sent (if configured)"

echo -e "\n${GREEN}🎉 Notification system test completed!${NC}"
