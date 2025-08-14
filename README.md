# 📚 Homework Application for Primary Education

A comprehensive full-stack application designed to streamline homework management in primary education settings.

## 🎨 Design Theme

- **Primary Color**: #0ea5e9 (Sky Blue)
- **Accent Color**: #1e3a8a (Indigo) 
- **Background**: #f0f9ff (Light Blue)
- **Typography**: Poppins font family
- **UI Style**: Card-based layouts with soft shadows and rounded corners

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Heroicons** for iconography
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Java 21** with Spring Boot 3.2
- **Spring Web** for REST APIs
- **Spring Data JPA** for database operations
- **Spring Security** with JWT authentication
- **MySQL** database

## 📁 Project Structure

```
Homework Application for Primary Education/
├── backend/                 # Java Spring Boot application
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/                # React Vite application
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── database/                # MySQL scripts
    ├── create_database.sql
    ├── schema.sql
    └── sample_data.sql
```

## 🚀 Quick Start

### Prerequisites
- Java 21 or higher
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### 1. Database Setup

```bash
# Connect to MySQL as root
mysql -u root -p

# Execute database scripts
source database/create_database.sql
source database/schema.sql
source database/sample_data.sql
```

### 2. Backend Setup

```bash
cd backend

# Build and run the Spring Boot application
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 👥 User Roles & Features

### 🔐 Authentication System
- **Admin**: System administration and user management
- **Teacher**: Create assignments, grade submissions, manage classes
- **Student**: View and submit homework, track progress
- **Parent**: Monitor child's homework and progress

### 📝 Core Features (Planned Implementation)

1. **User Authentication** - Role-based access control
2. **Homework Management** - Upload, assign, and track homework
3. **Submission System** - Student homework submissions
4. **Progress Tracking** - Analytics and reporting
5. **Announcements** - School-wide and class-specific notifications
6. **Support System** - Feedback and help requests
7. **Mobile Responsive** - Works on all devices

## 🎯 Implementation Plan

### ✅ Step 1: Project Setup (COMPLETED)
- Backend Spring Boot configuration
- Frontend React + Vite setup
- Database schema and sample data
- Development environment ready

### 🔄 Next Steps
2. User authentication system
3. Homework upload functionality  
4. Student homework view
5. Submission tracking
6. Announcements module
7. Support system
8. Analytics dashboard
9. Mobile responsiveness
10. Final polish and deployment

## 🗄️ Database Schema

### Key Tables
- `users` - All user types (Admin, Teacher, Student, Parent)
- `classes` - Grade levels and class management
- `subjects` - Subject categorization
- `homework` - Assignment details
- `homework_submissions` - Student submissions
- `announcements` - School communications
- `support_requests` - Help and feedback

## 🔧 Development

### Backend API Endpoints (Coming Soon)
- `/api/auth/*` - Authentication endpoints
- `/api/homework/*` - Homework management
- `/api/users/*` - User management
- `/api/classes/*` - Class management

### Frontend Components (Coming Soon)
- Authentication forms
- Dashboard layouts
- Homework management interfaces
- Responsive navigation
- Interactive animations

## 🤝 Contributing

This is an educational project following modern web development practices:

1. **Clean Architecture**: Separation of concerns
2. **Responsive Design**: Mobile-first approach  
3. **Modern UI/UX**: Intuitive and accessible interface
4. **Security Best Practices**: JWT authentication, input validation
5. **Performance**: Optimized loading and smooth animations

## 📄 License

This project is for educational purposes. Feel free to use and modify as needed.

---

**Ready for the next step?** 🚀 
Run the development servers and proceed with implementing user authentication! 