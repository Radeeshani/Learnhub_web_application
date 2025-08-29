#!/bin/bash

# Script to run the reports table migration
echo "Running Reports Table Migration..."

# Navigate to the database directory
cd database

# Check if MySQL is running
if ! mysqladmin ping -h localhost -u root -p12345678 --silent; then
    echo "Error: MySQL is not running. Please start MySQL first."
    exit 1
fi

# Run the migration
echo "Creating reports table..."
mysql -h localhost -u root -p12345678 homework_db < migrations/V15__add_reports_table.sql

if [ $? -eq 0 ]; then
    echo "✅ Reports table migration completed successfully!"
    echo "✅ Reports table created with sample data"
    echo "✅ You can now use the Reports feature in the application"
else
    echo "❌ Error: Reports table migration failed"
    exit 1
fi

echo ""
echo "Migration Summary:"
echo "- Created reports table with comprehensive student report fields"
echo "- Added foreign key constraints to users and classes tables"
echo "- Created indexes for better performance"
echo "- Added sample data for testing"
echo ""
echo "Next steps:"
echo "1. Restart your Spring Boot application"
echo "2. Teachers can now create reports via /reports route"
echo "3. Students can view their reports via /reports/student route"
