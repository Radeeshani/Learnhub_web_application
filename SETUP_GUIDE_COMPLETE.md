# 🚀 Complete Setup Guide for Homework Application (Windows PC)

This guide will walk you through setting up the Homework Application project on a Windows PC from scratch.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your Windows PC:

- **Java 17 or higher** (OpenJDK or Oracle JDK)
- **Maven 3.6+**
- **MySQL 8.0+**
- **Node.js 16+ and npm**
- **Git for Windows**

## 🔧 Step 1: Install Required Software

### 1.1 Install Java
**Option A: Download from Oracle**
1. Go to [Oracle JDK Downloads](https://www.oracle.com/java/technologies/downloads/)
2. Download JDK 17 or higher for Windows x64
3. Run the installer and follow the setup wizard
4. Add Java to PATH during installation

**Option B: Download from Adoptium (Recommended)**
1. Go to [Adoptium](https://adoptium.net/)
2. Download Eclipse Temurin JDK 17+ for Windows x64
3. Run the installer and follow the setup wizard
4. Ensure "Add to PATH" is checked during installation

**Verify installation:**
```cmd
# Open Command Prompt as Administrator
java -version
javac -version
```

### 1.2 Install Maven
1. Go to [Maven Downloads](https://maven.apache.org/download.cgi)
2. Download the Binary zip archive (apache-maven-x.x.x-bin.zip)
3. Extract to `C:\Program Files\Apache\maven`
4. Add to PATH:
   - Open System Properties → Advanced → Environment Variables
   - Add `C:\Program Files\Apache\maven\bin` to System PATH
   - Restart Command Prompt

**Verify installation:**
```cmd
mvn -version
```

### 1.3 Install MySQL
1. Go to [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. Download MySQL Community Server 8.0+ for Windows
3. Run the installer and choose "Developer Default" or "Server only"
4. Set root password during installation (remember this!)
5. Configure MySQL as a Windows Service (recommended)
6. Complete the installation

**Start MySQL service:**
```cmd
# Open Command Prompt as Administrator
net start mysql80
# or
net start mysql

# To enable auto-start:
sc config mysql80 start= auto
```

**Alternative: Use MySQL Installer**
1. Download MySQL Installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
2. Run the installer and follow the setup wizard
3. Choose "Developer Default" for development setup

### 1.4 Install Node.js
1. Go to [Node.js Downloads](https://nodejs.org/)
2. Download LTS version (18.x or higher) for Windows
3. Run the installer and follow the setup wizard
4. Ensure "Add to PATH" is checked during installation

**Verify installation:**
```cmd
node --version
npm --version
```

### 1.5 Install Git for Windows
1. Go to [Git for Windows](https://gitforwindows.org/)
2. Download and run the installer
3. Use default settings during installation
4. Ensure "Git from the command line and also from 3rd-party software" is selected

**Verify installation:**
```cmd
git --version
```

## 📥 Step 2: Clone/Download the Project

**Option A: Using Git (Recommended)**
```cmd
# Open Command Prompt in your desired directory
git clone <your-repository-url>
cd "Homework Application for Primary Education"
```

**Option B: Download ZIP**
1. Download the project as ZIP from your repository
2. Extract to your desired location
3. Rename the extracted folder to "Homework Application for Primary Education"
4. Open Command Prompt in that directory

## 🗄️ Step 3: Database Setup

### 3.1 Create MySQL Database
**Option A: Using MySQL Command Line**
```cmd
# Open Command Prompt as Administrator
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -p
# Enter your MySQL root password when prompted
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your local MySQL instance
3. Use the SQL Editor

**In MySQL console:**
```sql
-- Create the database
CREATE DATABASE homework_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a user (optional but recommended)
CREATE USER 'homework_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON homework_db.* TO 'homework_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3.2 Run Database Migrations
```cmd
# Navigate to project directory
cd "Homework Application for Primary Education"

# Run the database setup script
mysql -u root -p < database\setup_complete_database.sql

# Or run individual migrations
mysql -u root -p homework_db < database\migrations\V19__fix_grade_format_consistency.sql
```

**If you get "mysql command not found":**
```cmd
# Add MySQL to PATH or use full path
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database\setup_complete_database.sql
```

## ⚙️ Step 4: Backend Configuration

### 4.1 Configure Database Connection
Edit `backend\src\main\resources\application.yml` using Notepad++ or VS Code:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/homework_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
    username: root  # or your MySQL username
    password: your_mysql_password_here  # your actual MySQL password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 4.2 Configure Email Settings
In the same file, update email configuration:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME:your_email@gmail.com}
    password: ${EMAIL_PASSWORD:your_app_password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
        transport:
          protocol: smtp
    default-encoding: UTF-8

email:
  from: ${EMAIL_FROM:your_email@gmail.com}
```

**Important**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password instead of your regular password

### 4.3 Set Environment Variables (Optional)
1. Open System Properties → Advanced → Environment Variables
2. Add new System Variables:
   - `EMAIL_USERNAME` = your_email@gmail.com
   - `EMAIL_PASSWORD` = your_app_password
   - `EMAIL_FROM` = your_email@gmail.com
3. Restart Command Prompt after adding variables

## 🚀 Step 5: Start the Backend

### 5.1 Navigate to Backend Directory
```cmd
cd backend
```

### 5.2 Install Dependencies and Start
```cmd
# Clean and install dependencies
mvn clean install

# Start the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**Alternative**: Use the provided scripts:
```cmd
# Make scripts executable (if using Git Bash or WSL)
chmod +x ..\restart_backend.sh
chmod +x ..\start-application.sh

# Start backend
..\restart_backend.sh
```

**Windows Batch File Alternative:**
```cmd
# If you have .bat files, use them instead
..\restart_backend.bat
```

## 🌐 Step 6: Frontend Setup

### 6.1 Navigate to Frontend Directory
```cmd
# In a new Command Prompt, navigate to project root
cd "Homework Application for Primary Education"
cd frontend
```

### 6.2 Install Dependencies
```cmd
npm install
```

### 6.3 Start Frontend Development Server
```cmd
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🧪 Step 7: Testing the Setup

### 7.1 Test Backend
```cmd
# Test if backend is running
curl http://localhost:8080/api/email/test/configuration

# If curl is not available, use PowerShell:
Invoke-WebRequest -Uri "http://localhost:8080/api/email/test/configuration"
```

### 7.2 Test Frontend
Open `http://localhost:5173` in your browser

### 7.3 Test Complete Flow
```cmd
# Run the comprehensive test (if using Git Bash or WSL)
chmod +x ..\test_email_system_fixed.sh
..\test_email_system_fixed.sh

# Or use the Windows batch file if available
..\test_email_system_fixed.bat
```

## 🔑 Step 8: Create Test Users

### 8.1 Create Teacher Account
```cmd
# Access MySQL
mysql -u root -p homework_db

# Or use full path if not in PATH:
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p homework_db
```

```sql
-- Insert test teacher
INSERT INTO users (email, password, first_name, last_name, role, subject_taught) 
VALUES ('teacher@test.com', '$2a$10$example.hash.teacher', 'Test', 'Teacher', 'TEACHER', 'Mathematics');
```

### 8.2 Create Student Account
```sql
INSERT INTO users (email, password, first_name, last_name, role, class_grade, student_id) 
VALUES ('student@test.com', '$2a$10$example.hash.student', 'Test', 'Student', 'STUDENT', '4th Grade', 'STU001');
```

## 🚨 Troubleshooting (Windows-Specific)

### Common Issues and Solutions

#### 1. Database Connection Failed
```cmd
# Check if MySQL service is running
sc query mysql80
# or
sc query mysql

# Start MySQL service
net start mysql80

# Check MySQL connection
mysql -u root -p -h localhost

# If "mysql command not found", add to PATH or use full path
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

#### 2. Port Already in Use
```cmd
# Check what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### 3. Java Not Found
```cmd
# Check Java installation
java -version

# If not found, add Java to PATH:
# 1. Open System Properties → Advanced → Environment Variables
# 2. Add Java bin directory to System PATH
# 3. Restart Command Prompt
```

#### 4. Maven Not Found
```cmd
# Check Maven installation
mvn -version

# If not found, add Maven to PATH:
# 1. Open System Properties → Advanced → Environment Variables
# 2. Add Maven bin directory to System PATH
# 3. Restart Command Prompt
```

#### 5. Email Not Working
- Verify Gmail App Password is correct
- Check if 2FA is enabled on Gmail
- Verify SMTP settings in application.yml
- Check Windows Firewall settings

#### 6. Frontend Build Errors
```cmd
# Clear node modules and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

#### 7. Maven Build Errors
```cmd
# Clean and rebuild
mvn clean
mvn install -DskipTests
```

#### 8. Permission Issues
```cmd
# Run Command Prompt as Administrator for:
# - MySQL service management
# - Environment variable changes
# - Port binding issues
```

## 📁 Project Structure (Windows Paths)

```
Homework Application for Primary Education\
├── backend\                 # Spring Boot backend
│   ├── src\main\java\      # Java source code
│   ├── src\main\resources\ # Configuration files
│   └── pom.xml            # Maven dependencies
├── frontend\               # React frontend
│   ├── src\               # React source code
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration
├── database\               # Database scripts and migrations
├── uploads\                # File uploads directory
└── scripts\                # Utility scripts
```

## 🚀 Quick Start Commands (Windows)

```cmd
# 1. Start MySQL service (as Administrator)
net start mysql80

# 2. Start Backend (Command Prompt 1)
cd backend
mvn spring-boot:run

# 3. Start Frontend (Command Prompt 2)
cd frontend
npm run dev

# 4. Test the system
curl http://localhost:8080/api/email/test/configuration
```

## 📧 Email Configuration Details

### Gmail Setup
1. Go to Google Account settings
2. Enable 2-Step Verification
3. Generate App Password:
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Homework App" as name
   - Copy the generated 16-character password
4. Use this password in `application.yml`

### Alternative Email Providers
- **Outlook/Hotmail**: Use `smtp-mail.outlook.com:587`
- **Yahoo**: Use `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Update host and port in configuration

## 🔒 Security Considerations

1. **Never commit passwords** to version control
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Regular database backups**
5. **Keep dependencies updated**
6. **Configure Windows Firewall** appropriately

## 📞 Support

If you encounter issues:
1. Check the logs in `backend.log`
2. Verify all services are running
3. Check database connectivity
4. Ensure all ports are available
5. Verify email credentials
6. Check Windows Event Viewer for service errors

## ✅ Verification Checklist

- [ ] Java 17+ installed and in PATH
- [ ] Maven 3.6+ installed and in PATH
- [ ] MySQL 8.0+ running as Windows service
- [ ] Node.js 16+ installed and in PATH
- [ ] Database created and migrated
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Email configuration working
- [ ] Test users created
- [ ] Complete flow tested
- [ ] Windows Firewall configured (if needed)

## 🪟 Windows-Specific Tips

1. **Use Command Prompt as Administrator** for service management
2. **Check Windows Services** for MySQL status
3. **Use Windows Event Viewer** for troubleshooting
4. **Configure Windows Firewall** if needed
5. **Use full paths** if commands are not found
6. **Restart Command Prompt** after changing PATH variables

---

**🎉 Congratulations!** Your Homework Application is now set up and ready to use on Windows!
