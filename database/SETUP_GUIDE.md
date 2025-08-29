# Homework Application - Setup Guide for New PC

## 🚀 Quick Setup Instructions

### 1. Prerequisites
- **Java 17+** installed
- **Node.js 16+** and npm installed
- **MySQL 8.0+** installed and running
- **Git** installed

### 2. Clone the Repository
```bash
git clone https://github.com/Radeeshani/Homework-Application-for-Primary-Education.git
cd Homework-Application-for-Primary-Education
```

### 3. Database Setup
```bash
# Navigate to database folder
cd database

# Run the complete database setup script
mysql -u root -p < setup_complete_database.sql
```

**Default Database Credentials:**
- Database: `homework_db`
- Username: `root`
- Password: `12345678` (update this in application.yml)

### 4. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Update database credentials in application.yml if needed
# Edit: src/main/resources/application.yml

# Build and run the application
mvn clean install
mvn spring-boot:run
```

**Backend will run on:** `http://localhost:8080`

### 5. Frontend Setup
```bash
# Open new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

**Frontend will run on:** `http://localhost:3000`

### 6. Default Admin Account
- **Email:** `admin@homework.com`
- **Password:** `admin123`

## 📁 Project Structure

```
Homework-Application-for-Primary-Education/
├── backend/                 # Spring Boot application
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml            # Maven dependencies
├── frontend/               # React application
│   ├── src/components/     # React components
│   ├── src/context/        # React context providers
│   └── package.json        # Node.js dependencies
├── database/               # Database scripts
│   ├── setup_complete_database.sql  # Complete DB setup
│   └── migrations/         # Individual migration files
└── uploads/                # File uploads directory
```

## 🔧 Configuration Files

### Backend Configuration (`backend/src/main/resources/application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/homework_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: 12345678  # Update this password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### Frontend Configuration
- API base URL is configured to point to `http://localhost:8080/api`
- No additional configuration needed for development

## 🗄️ Database Tables

The application includes the following main tables:

1. **users** - User accounts and profiles
2. **classes** - Class information
3. **enrollments** - Student class enrollments
4. **homeworks** - Homework assignments
5. **homework_submissions** - Student submissions
6. **calendar_events** - Calendar events
7. **reminders** - User reminders
8. **notifications** - User notifications
9. **reports** - Student reports
10. **achievements** - Gamification achievements
11. **library_books** - Digital library

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Ensure MySQL is running
   - Check credentials in `application.yml`
   - Verify database `homework_db` exists

2. **Port Already in Use**
   - Backend: Change port in `application.yml` (default: 8080)
   - Frontend: Change port in `package.json` scripts (default: 3000)

3. **Java Version Issues**
   - Ensure Java 17+ is installed
   - Check `JAVA_HOME` environment variable

4. **Node.js Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and run `npm install` again

### Logs:
- **Backend:** Check console output for Spring Boot logs
- **Frontend:** Check browser console for React errors

## 📱 Features Available

- ✅ User authentication and authorization
- ✅ Role-based access control (Admin, Teacher, Student, Parent)
- ✅ Homework management system
- ✅ Calendar and event management
- ✅ Student progress tracking
- ✅ File uploads and management
- ✅ Notification system
- ✅ Reminder system
- ✅ Report generation
- ✅ Gamification (achievements, points)
- ✅ Digital library
- ✅ Responsive web design

## 🔐 Security Notes

- **JWT Secret:** Update the JWT secret in `application.yml` for production
- **Database Password:** Use strong passwords in production
- **HTTPS:** Enable HTTPS for production deployment
- **Environment Variables:** Use environment variables for sensitive data

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs
3. Check GitHub issues for known problems
4. Create a new issue with detailed error information

---

**Happy Coding! 🎉**
