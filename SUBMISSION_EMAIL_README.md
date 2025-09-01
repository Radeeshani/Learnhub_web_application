# Homework Submission Email System

## Overview
This document describes the new email notification system that automatically sends emails to teachers when students submit homework, and to students when their homework is graded.

## Features

### 1. Student Submission → Teacher Notification
- **Automatic Email**: When a student submits homework, the teacher automatically receives an email
- **Rich Content**: Email includes homework details, student information, and submission content
- **Real-time**: Emails are sent immediately upon submission

### 2. Teacher Grading → Student Notification
- **Grade Notification**: Students receive emails when their homework is graded
- **Feedback Included**: Email contains the grade and any feedback provided by the teacher
- **Complete Details**: Includes homework information and submission details

## Email Content

### Submission Email to Teacher
```
Subject: New Homework Submission: [Homework Title]

Hello [Teacher Name],

A student has submitted homework for your review!

Homework Details:
- Title: [Homework Title]
- Subject: [Subject]
- Grade: [Grade Level]
- Due Date: [Due Date]

Student Information:
- Name: [Student First Name] [Student Last Name]
- Email: [Student Email]
- Submission Type: [Text/Voice/Photo/PDF]
- Submitted At: [Submission Time]

Submission Content:
[Student's submitted text or description]

Please log in to your account to review and grade this submission.

Best regards,
LearnHub System
```

### Graded Email to Student
```
Subject: Homework Graded: [Homework Title]

Hello [Student Name],

Your homework has been graded!

Homework Details:
- Title: [Homework Title]
- Subject: [Subject]
- Grade: [Grade Level]
- Submitted At: [Submission Time]

Grade: [Grade]

Feedback:
[Teacher's feedback]

Please log in to your account to view the complete feedback and details.

Best regards,
Your Teacher
```

## Technical Implementation

### 1. EmailService Updates
- **New Method**: `sendHomeworkSubmissionEmail()` - Sends emails to teachers
- **New Method**: `sendHomeworkGradedEmail()` - Sends emails to students
- **Enhanced Content**: Rich email templates with comprehensive information
- **Error Handling**: Graceful handling of email failures

### 2. HomeworkSubmissionService Integration
- **Automatic Trigger**: Emails sent automatically when homework is submitted
- **Non-blocking**: Email failures don't prevent homework submission
- **Logging**: Comprehensive logging for debugging and monitoring

### 3. New API Endpoints
- **Test Submission Email**: `POST /api/email/test/submission-email`
- **Test Graded Email**: `POST /api/email/test/graded-email`

## API Endpoints

### Test Submission Email
```bash
POST /api/email/test/submission-email
Parameters:
- homeworkId: ID of the homework
- studentId: ID of the student

Example:
curl -X POST "http://localhost:8080/api/email/test/submission-email?homeworkId=1&studentId=2"
```

### Test Graded Email
```bash
POST /api/email/test/graded-email
Parameters:
- homeworkId: ID of the homework
- studentId: ID of the student
- grade: Grade given (e.g., "A", "85", "Excellent")
- feedback: Teacher's feedback

Example:
curl -X POST "http://localhost:8080/api/email/test/graded-email?homeworkId=1&studentId=2&grade=A&feedback=Excellent%20work!"
```

## How It Works

### 1. Homework Submission Flow
1. Student submits homework through the frontend
2. `HomeworkSubmissionService.submitHomework()` is called
3. Homework submission is saved to database
4. Notification is created for the teacher
5. **Email is automatically sent to the teacher**
6. Gamification processing occurs
7. Response is returned to the student

### 2. Homework Grading Flow
1. Teacher grades homework through the frontend
2. Grade and feedback are saved
3. **Email is automatically sent to the student**
4. Notification is created for the student
5. Response is returned to the teacher

### 3. Email Sending Process
1. **Submission Email**:
   - Find the teacher who assigned the homework
   - Create email content with submission details
   - Send email to teacher's email address
   - Log success/failure

2. **Graded Email**:
   - Get student information
   - Create email content with grade and feedback
   - Send email to student's email address
   - Log success/failure

## Configuration

### Email Settings
The system uses the same email configuration as the homework creation emails:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME:ashfak25321@gmail.com}
    password: ${EMAIL_PASSWORD:aahy bavj ftvf dtqh}
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
  from: ${EMAIL_FROM:ashfak25321@gmail.com}
```

## Testing

### 1. Test Email Configuration
```bash
curl http://localhost:8080/api/email/test-config
```

### 2. Test Submission Emails
```bash
# Test submission email (replace IDs with actual values)
curl -X POST "http://localhost:8080/api/email/test/submission-email?homeworkId=1&studentId=2"
```

### 3. Test Graded Emails
```bash
# Test graded email (replace IDs with actual values)
curl -X POST "http://localhost:8080/api/email/test/graded-email?homeworkId=1&studentId=2&grade=A&feedback=Excellent%20work!"
```

### 4. Run Test Script
```bash
./test_submission_emails.sh
```

## Error Handling

### 1. Email Failures
- **Non-blocking**: Email failures don't prevent homework operations
- **Logging**: All failures are logged with detailed error information
- **Graceful Degradation**: System continues to function even if emails fail

### 2. Common Issues
- **Teacher Not Found**: If homework has invalid teacher ID
- **Email Configuration**: SMTP settings or credentials issues
- **Network Issues**: Connection problems to email server

### 3. Debug Steps
1. Check backend logs for email-related messages
2. Verify email configuration in `application.yml`
3. Test email endpoints manually
4. Check if teacher/student IDs are valid

## Monitoring

### 1. Log Messages
- **Success**: "✅ Homework submission email sent successfully to teacher: [email]"
- **Failure**: "❌ Failed to send homework submission email: [error]"
- **Summary**: Email sending statistics and counts

### 2. Email Health
- **Health Check**: `GET /api/email/health`
- **Configuration Test**: `GET /api/email/test-config`
- **Real-time Status**: Monitor logs for email activity

## Security Considerations

### 1. Access Control
- **Test Endpoints**: Only accessible to authenticated users
- **Email Content**: No sensitive information in emails
- **Rate Limiting**: Consider implementing to prevent spam

### 2. Data Privacy
- **Student Information**: Only basic details included in teacher emails
- **Teacher Information**: Only basic details included in student emails
- **No Passwords**: Never include authentication credentials

## Future Enhancements

### 1. Email Templates
- **Customizable Templates**: Allow teachers to customize email content
- **Multiple Languages**: Support for different languages
- **Rich HTML**: Enhanced formatting and styling

### 2. Email Preferences
- **Teacher Preferences**: Choose when to receive submission emails
- **Student Preferences**: Choose when to receive graded emails
- **Frequency Control**: Daily/weekly summaries instead of individual emails

### 3. Advanced Features
- **Email Scheduling**: Delayed sending for better timing
- **Bulk Operations**: Send multiple emails at once
- **Email Tracking**: Track delivery and read status

## Troubleshooting

### 1. No Emails Received
- Check backend logs for email activity
- Verify email configuration
- Test email endpoints manually
- Check spam/junk folders

### 2. Email Configuration Issues
- Verify SMTP settings in `application.yml`
- Check Gmail app password (not regular password)
- Ensure 2-factor authentication is enabled
- Test with email health endpoints

### 3. Missing Teacher/Student Data
- Verify homework has valid teacher ID
- Check if student exists in database
- Ensure proper relationships between entities

## Conclusion

The homework submission email system provides:
- **Automatic Notifications**: Teachers are immediately notified of new submissions
- **Grade Feedback**: Students receive prompt feedback on their work
- **Reliable Delivery**: Robust error handling and logging
- **Easy Testing**: Comprehensive test endpoints for verification
- **Professional Communication**: Well-formatted, informative emails

This system ensures that both teachers and students stay informed about homework progress, improving communication and engagement in the learning process.
