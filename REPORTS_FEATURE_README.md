# Student Reports Feature

## Overview

The Student Reports feature allows teachers to create comprehensive academic progress reports for students in their assigned classes. Students can view their published reports to track their performance and progress.

## Features

### For Teachers
- **Create Reports**: Generate detailed student progress reports with analytics
- **Auto-calculated Analytics**: Automatic calculation of homework completion rates, average scores, and submission statistics
- **Comprehensive Assessment**: Include strengths, areas for improvement, teacher notes, and recommendations
- **Report Management**: Edit, update, and delete reports as needed
- **Publishing Control**: Control whether reports are visible to students
- **Class-based Access**: Only access students enrolled in assigned classes

### For Students
- **View Reports**: Access published reports from their teachers
- **Performance Analytics**: See detailed statistics and performance metrics
- **Progress Tracking**: Monitor academic progress over time
- **Download Reports**: PDF download functionality (coming soon)

## Technical Implementation

### Backend Components

#### 1. Report Entity (`Report.java`)
- Comprehensive data model for student reports
- Includes performance metrics, teacher feedback, and academic data
- Supports academic periods and publishing status

#### 2. Report Repository (`ReportRepository.java`)
- Data access layer with optimized queries
- Supports filtering by teacher, class, student, and academic period
- Includes methods for access control and data retrieval

#### 3. Report Service (`ReportService.java`)
- Business logic for report creation and management
- Automatic analytics calculation from homework data
- Access control and validation logic
- Student performance analytics computation

#### 4. Report Controller (`ReportController.java`)
- RESTful API endpoints for report operations
- JWT-based authentication and authorization
- Comprehensive error handling and logging

### Frontend Components

#### 1. Teacher Reports (`Reports.jsx`)
- Dashboard for creating and managing student reports
- Search and filtering capabilities
- Modal forms for report creation and editing
- Responsive grid layout for report management

#### 2. Student Reports (`StudentReports.jsx`)
- Student view of published reports
- Detailed report display with performance metrics
- Interactive report cards with click-to-view functionality
- Performance indicators and visual feedback

### Database Schema

#### Reports Table
```sql
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    student_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    academic_period VARCHAR(100) NOT NULL,
    report_date TIMESTAMP NOT NULL,
    overall_grade VARCHAR(10),
    homework_completion_rate DECIMAL(5,2),
    average_score DECIMAL(5,2),
    total_homeworks_assigned INT,
    total_homeworks_completed INT,
    on_time_submissions INT,
    late_submissions INT,
    strengths TEXT,
    areas_for_improvement TEXT,
    teacher_notes TEXT,
    recommendations TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### Teacher Endpoints
- `POST /api/reports` - Create a new report
- `GET /api/reports/teacher` - Get all reports by teacher
- `GET /api/reports/teacher/class/{classId}` - Get reports by teacher and class
- `PUT /api/reports/{reportId}` - Update a report
- `DELETE /api/reports/{reportId}` - Delete a report

### Student Endpoints
- `GET /api/reports/student` - Get published reports for student
- `GET /api/reports/{reportId}` - Get specific report (with access control)

### General Endpoints
- `GET /api/reports/health` - Health check endpoint

## Installation and Setup

### 1. Database Migration
Run the migration script to create the reports table:
```bash
./run-reports-migration.sh
```

### 2. Backend Setup
The Reports feature is automatically integrated into the Spring Boot application. No additional configuration is required.

### 3. Frontend Setup
The Reports components are automatically available in the React application. Teachers will see a "Reports" tab in their sidebar, and students will see a "Reports" tab in their sidebar.

## Usage Guide

### Creating a Report (Teachers)

1. Navigate to the Reports section in the teacher sidebar
2. Click "Create Report" button
3. Fill in the required information:
   - Report title
   - Select class and student
   - Choose academic period
   - Enter overall grade
   - Add strengths and areas for improvement
   - Include teacher notes and recommendations
4. Choose whether to publish the report immediately
5. Click "Create Report" to save

### Viewing Reports (Students)

1. Navigate to the Reports section in the student sidebar
2. Click on any report card to view full details
3. Review performance metrics and teacher feedback
4. Use the download button to save reports (PDF functionality coming soon)

## Security Features

### Access Control
- Teachers can only access reports for students in their assigned classes
- Students can only view published reports assigned to them
- JWT-based authentication for all API endpoints

### Data Validation
- Input validation for all report fields
- Duplicate report prevention (one report per student per class per period)
- Foreign key constraints for data integrity

## Performance Considerations

### Database Optimization
- Indexed fields for common query patterns
- Efficient joins for related data retrieval
- Optimized queries for analytics calculation

### Frontend Performance
- Lazy loading of report data
- Efficient state management
- Responsive design for mobile devices

## Future Enhancements

### Planned Features
- **PDF Generation**: Server-side PDF report generation
- **Email Reports**: Automatic email delivery to parents
- **Report Templates**: Customizable report templates
- **Advanced Analytics**: Charts and graphs for performance visualization
- **Bulk Operations**: Mass report generation for entire classes
- **Report Scheduling**: Automated report generation at set intervals

### Analytics Improvements
- **Trend Analysis**: Performance tracking over time
- **Comparative Reports**: Class and grade-level comparisons
- **Predictive Analytics**: Performance forecasting based on historical data

## Troubleshooting

### Common Issues

#### Report Creation Fails
- Verify the student is enrolled in the selected class
- Check that the teacher is assigned to the class
- Ensure all required fields are completed

#### Students Can't See Reports
- Verify the report is marked as published
- Check that the student is enrolled in the class
- Confirm the report was created for the correct student

#### Analytics Not Calculating
- Ensure homework submissions exist for the class
- Check that homework data is properly linked to classes
- Verify the database migration was successful

### Debug Information
- Check application logs for detailed error messages
- Verify database connections and table structure
- Test API endpoints with Postman or similar tools

## Support and Maintenance

### Monitoring
- Application logs for error tracking
- Database performance monitoring
- API endpoint usage statistics

### Maintenance
- Regular database cleanup for old reports
- Performance optimization for large datasets
- Security updates and patches

## Contributing

When contributing to the Reports feature:
1. Follow the existing code style and patterns
2. Add comprehensive tests for new functionality
3. Update documentation for any API changes
4. Ensure proper error handling and validation
5. Test with various user roles and permissions

---

For technical support or feature requests, please refer to the main project documentation or create an issue in the project repository.
