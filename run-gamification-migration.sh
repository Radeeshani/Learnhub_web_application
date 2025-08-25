#!/bin/bash

echo "🚀 Running Gamification Enhancement Migration..."
echo "================================================"

# Check if MySQL is running
if ! mysqladmin ping -h localhost -u root -p12345678 --silent; then
    echo "❌ MySQL is not running. Please start MySQL first."
    exit 1
fi

echo "✅ MySQL is running"

# Run the migration
echo "📊 Applying gamification enhancements..."
mysql -h localhost -u root -p12345678 homework_db < database/migrations/V7__add_gamification_enhancements_corrected.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🎯 New features added:"
    echo "   • Level progression system (5 levels: Novice to Grandmaster)"
    echo "   • Daily/Weekly/Monthly challenges"
    echo "   • Enhanced user progress tracking"
    echo "   • Challenge progress monitoring"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Restart your Spring Boot backend"
    echo "   2. Test the new gamification endpoints"
    echo "   3. Navigate to the Progress page in the frontend"
    echo ""
    echo "🎮 Enjoy your enhanced gamification system!"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
