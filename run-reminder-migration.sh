#!/bin/bash

echo "Running Reminder Priority Migration..."

# Navigate to the database directory
cd database

# Run the migration
echo "Executing V14__add_priority_to_reminders.sql..."
mysql -u root -p homework_db < migrations/V14__add_priority_to_reminders.sql

echo "Migration completed!"
echo "The priority column has been added to the reminders table."
echo "Existing reminders have been updated with appropriate priority values."
