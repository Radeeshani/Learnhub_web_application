#!/bin/bash

echo "🚀 Homework Application Setup Script for New PC"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [[ $JAVA_VERSION -ge 17 ]]; then
        print_success "Java $JAVA_VERSION found"
    else
        print_error "Java 17+ required, found version $JAVA_VERSION"
        echo "Please install Java 17 or higher"
        exit 1
    fi
else
    print_error "Java not found. Please install Java 17 or higher"
    exit 1
fi

# Check Maven
if command -v mvn &> /dev/null; then
    print_success "Maven found"
else
    print_error "Maven not found. Please install Maven 3.6+"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    print_success "MySQL client found"
else
    print_warning "MySQL client not found. Please install MySQL 8.0+"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -ge 16 ]]; then
        print_success "Node.js $NODE_VERSION found"
    else
        print_error "Node.js 16+ required, found version $NODE_VERSION"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm found"
else
    print_error "npm not found. Please install npm"
    exit 1
fi

echo ""

# Step 2: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads/homework
mkdir -p uploads/profile-pictures
print_success "Directories created"

# Step 3: Database setup
print_status "Setting up database..."
if command -v mysql &> /dev/null; then
    echo "Please enter your MySQL root password when prompted:"
    if mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS homework_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
        print_success "Database 'homework_db' created/verified"
        
        # Run migrations if they exist
        if [ -f "database/setup_complete_database.sql" ]; then
            print_status "Running database setup script..."
            mysql -u root -p homework_db < database/setup_complete_database.sql
            print_success "Database setup completed"
        fi
    else
        print_warning "Could not create database. Please create it manually:"
        echo "mysql -u root -p"
        echo "CREATE DATABASE homework_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    fi
else
    print_warning "MySQL not available. Please set up database manually:"
    echo "1. Install MySQL 8.0+"
    echo "2. Create database: homework_db"
    echo "3. Run: mysql -u root -p homework_db < database/setup_complete_database.sql"
fi

echo ""

# Step 4: Backend setup
print_status "Setting up backend..."
cd backend

# Check if application.yml exists
if [ -f "src/main/resources/application.yml" ]; then
    print_status "Configuring application.yml..."
    
    # Backup original file
    cp src/main/resources/application.yml src/main/resources/application.yml.backup
    
    # Ask for database password
    echo ""
    read -p "Enter your MySQL root password: " MYSQL_PASSWORD
    
    # Update database configuration
    sed -i.bak "s/password: 12345678/password: $MYSQL_PASSWORD/g" src/main/resources/application.yml
    
    print_success "Database configuration updated"
    
    # Ask for email configuration
    echo ""
    read -p "Enter your Gmail address (or press Enter to skip): " EMAIL_ADDRESS
    if [ ! -z "$EMAIL_ADDRESS" ]; then
        read -s -p "Enter your Gmail App Password: " EMAIL_PASSWORD
        echo ""
        
        # Update email configuration
        sed -i.bak "s/ashfak25321@gmail.com/$EMAIL_ADDRESS/g" src/main/resources/application.yml
        sed -i.bak "s/aahy bavj ftvf dtqh/$EMAIL_PASSWORD/g" src/main/resources/application.yml
        
        print_success "Email configuration updated"
    fi
else
    print_error "application.yml not found in backend/src/main/resources/"
fi

cd ..

echo ""

# Step 5: Frontend setup
print_status "Setting up frontend..."
cd frontend

if [ -f "package.json" ]; then
    print_status "Installing frontend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
    fi
else
    print_error "package.json not found in frontend directory"
fi

cd ..

echo ""

# Step 6: Make scripts executable
print_status "Making scripts executable..."
chmod +x *.sh
chmod +x backend/*.sh
print_success "Scripts made executable"

echo ""

# Step 7: Final instructions
print_success "Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Start MySQL service: sudo systemctl start mysql"
echo "2. Start backend: cd backend && mvn spring-boot:run"
echo "3. Start frontend (new terminal): cd frontend && npm run dev"
echo "4. Test the system: ./test_email_system_fixed.sh"
echo ""
echo "📚 For detailed instructions, see: SETUP_GUIDE_COMPLETE.md"
echo ""
echo "🔧 If you encounter issues:"
echo "- Check the logs in backend.log"
echo "- Verify all services are running"
echo "- Ensure database is accessible"
echo "- Check email configuration"
echo ""
echo "🎉 Good luck with your Homework Application!"


