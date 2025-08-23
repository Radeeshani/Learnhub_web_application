#!/bin/bash

echo "🔍 Testing Database Connection and Setup..."
echo "=========================================="

# Test MySQL connection
echo "1. Testing MySQL connection..."
if mysql -u root -p12345678 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ MySQL connection successful"
else
    echo "❌ MySQL connection failed"
    echo "   Please check:"
    echo "   - MySQL is running"
    echo "   - Password is correct (12345678)"
    echo "   - MySQL user 'root' exists"
    exit 1
fi

# Check if database exists
echo "2. Checking if database exists..."
if mysql -u root -p12345678 -e "USE homework_db;" >/dev/null 2>&1; then
    echo "✅ Database 'homework_db' exists"
else
    echo "❌ Database 'homework_db' does not exist"
    echo "   Run: ./reset-database.sh"
    exit 1
fi

# Check if users table exists and has data
echo "3. Checking users table..."
USER_COUNT=$(mysql -u root -p12345678 -s -N -e "SELECT COUNT(*) FROM homework_db.users;")
if [ $? -eq 0 ]; then
    echo "✅ Users table exists with $USER_COUNT users"
    
    if [ $USER_COUNT -gt 0 ]; then
        echo "4. Checking demo users..."
        mysql -u root -p12345678 -e "SELECT email, role FROM homework_db.users;" 2>/dev/null
    else
        echo "❌ Users table is empty"
        echo "   Run: ./reset-database.sh"
        exit 1
    fi
else
    echo "❌ Users table does not exist or has issues"
    echo "   Run: ./reset-database.sh"
    exit 1
fi

echo ""
echo "🎉 Database setup looks good!"
echo "You can now test the registration and login endpoints."
