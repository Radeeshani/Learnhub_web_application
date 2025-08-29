#!/bin/bash

echo "🔄 Resetting LearnHub Database..."
echo "============================================="

# Check if MySQL is accessible
if ! mysql -u root -p12345678 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ Cannot connect to MySQL. Please check:"
    echo "   1. MySQL is running"
    echo "   2. Password is correct (currently set to: 12345678)"
    echo "   3. MySQL user 'root' exists"
    exit 1
fi

echo "✅ MySQL connection successful"

# Drop and recreate the database
echo "🗑️  Dropping existing database..."
mysql -u root -p12345678 -e "DROP DATABASE IF EXISTS homework_db;"

echo "🏗️  Creating new database with correct data..."
mysql -u root -p12345678 < database/setup_database_corrected.sql

if [ $? -eq 0 ]; then
    echo "✅ Database reset successful!"
    echo ""
    echo "🎉 Your database now contains:"
    echo "   - All required tables with proper structure"
    echo "   - Demo users with correct password hashes"
    echo "   - Sample data for testing"
    echo ""
    echo "👥 Demo Users (ready to use):"
    echo "   Admin: admin@homework.com / admin123"
    echo "   Teacher: teacher@homework.com / teacher123"
    echo "   Student: student@homework.com / student123"
    echo "   Parent: parent@homework.com / parent123"
    echo ""
    echo "🚀 You can now restart your application and test the login!"
else
    echo "❌ Database reset failed. Please check the error messages above."
    exit 1
fi
