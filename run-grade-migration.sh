#!/bin/bash

echo "Running Grade Column Migration for Homeworks Table..."

# Navigate to the database directory
cd database

# Run the migration
echo "Executing V13__add_grade_column_to_homeworks.sql..."
mysql -u root -p homework_db < migrations/V13__add_grade_column_to_homeworks.sql

echo "Migration completed!"
echo "The grade column has been added to the homeworks table."
echo "Existing homeworks have been updated with default grade values."
