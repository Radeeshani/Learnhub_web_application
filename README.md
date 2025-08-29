# LearnHub - Your Learning Companion

A comprehensive web application designed for primary education institutions to manage homework assignments, student submissions, and educational activities.

## Features

- **User Management**: Support for Admin, Teacher, Student, and Parent roles
- **Homework Management**: Create, assign, and track homework assignments
- **Submission System**: Multiple submission types (text, voice, photo, PDF)
- **Grading System**: Grade assignments and provide feedback
- **Class Management**: Organize students into classes with enrollments
- **Calendar Integration**: Track due dates and educational events
- **Gamification**: Badge system and progress tracking
- **Notifications**: Real-time notifications for various events
- **File Upload**: Support for various file types and attachments

## Technology Stack

### Backend
- **Java 17** with **Spring Boot 3.2.0**
- **Spring Security** with JWT authentication
- **Spring Data JPA** for data persistence
- **MySQL** database
- **Maven** for dependency management

### Frontend
- **React 18** with **Vite** build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for HTTP requests
- **Framer Motion** for animations

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Quick Start

### 1. Database Setup

First, ensure MySQL is running and create the database:

```bash
# Connect to MySQL as root
mysql -u root -p

# Run the setup script
source database/setup_database.sql
```

**Default Database Credentials:**
- Database: `homework_db`
- Username: `root`
- Password: `Ashmhmd25321`

### 2. Backend Setup

```bash
cd backend

# Update database configuration if needed
# Edit src/main/resources/application.yml

# Compile and run
mvn clean compile
mvn spring-boot:run
```

The backend will start on `http://localhost:8080/api`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Default Users

The application comes with pre-configured demo users:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@homework.com | admin123 | System administrator |
| Teacher | teacher@homework.com | teacher123 | Mathematics teacher |
| Student | student@homework.com | student123 | 3rd Grade student |
| Parent | parent@homework.com | parent123 | Parent of Emma Johnson |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Homework Management
- `GET /api/homework` - List all homework
- `POST /api/homework` - Create new homework
- `PUT /api/homework/{id}` - Update homework
- `DELETE /api/homework/{id}` - Delete homework

### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Submit homework
- `PUT /api/submissions/{id}/grade` - Grade submission

### Classes
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `GET /api/classes/{id}/enrollments` - Get class enrollments

## Project Structure

```
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   ├── config/         # Configuration classes
│   │   ├── controller/     # REST controllers
│   │   ├── dto/           # Data transfer objects
│   │   ├── entity/        # JPA entities
│   │   ├── repository/    # Data repositories
│   │   ├── security/      # Security configuration
│   │   └── service/       # Business logic
│   └── src/main/resources/
│       └── application.yml # Application configuration
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   └── main.jsx       # Application entry point
│   └── package.json       # Frontend dependencies
├── database/               # Database scripts
│   ├── setup_database.sql # Complete database setup
│   └── migrations/        # Database migration files
└── README.md              # This file
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different user roles
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Server-side validation for all inputs

## File Upload Support

The application supports various file types:
- **Images**: PNG, JPG, JPEG, WebP
- **Documents**: PDF, DOC, DOCX
- **Audio**: MP3, WAV, M4A
- **Maximum file size**: 10MB

## Development

### Backend Development

```bash
cd backend

# Run with hot reload
mvn spring-boot:run

# Run tests
mvn test

# Package application
mvn package
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure MySQL is running
   - Check database credentials in `application.yml`
   - Verify database exists: `homework_db`

2. **JWT Token Issues**
   - Check JWT secret in `application.yml`
   - Ensure JWT dependencies are properly added to `pom.xml`

3. **Frontend Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **CORS Issues**
   - Verify CORS configuration in `WebSecurityConfig.java`
   - Check frontend URL in backend CORS settings

### Logs

- **Backend logs**: Check console output or application logs
- **Frontend logs**: Check browser console for JavaScript errors
- **Database logs**: Check MySQL error logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation and troubleshooting sections

## Future Enhancements

- **Real-time Communication**: WebSocket support for live updates
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Learning analytics and progress reports
- **Integration**: LMS integration and third-party tools
- **Multi-language Support**: Internationalization (i18n)
- **Offline Support**: Progressive Web App (PWA) features 