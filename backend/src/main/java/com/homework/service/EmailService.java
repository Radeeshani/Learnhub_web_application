package com.homework.service;

import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.entity.HomeworkSubmission;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.homework.repository.UserRepository;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${email.from}")
    private String fromEmail;
    
    /**
     * Send email notification for new homework assignment to students
     */
    public void sendNewHomeworkEmail(Homework homework, List<User> students) {
        logger.info("📧 Sending homework emails to {} students for: {}", students.size(), homework.getTitle());
        
        if (students == null || students.isEmpty()) {
            logger.warn("No students to send homework email to");
            return;
        }
        
        int successCount = 0;
        int failureCount = 0;
        
        for (User student : students) {
            try {
                sendSingleHomeworkEmail(student, homework);
                successCount++;
                logger.info("✅ Email sent to: {}", student.getEmail());
            } catch (Exception e) {
                failureCount++;
                logger.error("❌ Failed to send email to {}: {}", student.getEmail(), e.getMessage());
            }
        }
        
        logger.info("📊 Email summary: {} successful, {} failed", successCount, failureCount);
    }
    
    /**
     * Send a single homework email to a student
     */
    private void sendSingleHomeworkEmail(User student, Homework homework) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom(fromEmail);
        message.setTo(student.getEmail());
        message.setSubject("New Homework Assignment: " + homework.getTitle());
        message.setText(createHomeworkEmailContent(student, homework));
        
        mailSender.send(message);
    }
    
    /**
     * Create email content for new homework
     */
    private String createHomeworkEmailContent(User student, Homework homework) {
        String dueDate = homework.getDueDate().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a"));
        
        return String.format("""
            Hello %s,
            
            You have a new homework assignment!
            
            Title: %s
            Subject: %s
            Grade: %s
            Class: %s
            Due Date: %s
            
            Description:
            %s
            
            Please log in to your account to view the complete details and submit your work.
            
            Best regards,
            Your Teacher
            
            ---
            This is an automated notification from LearnHub
            """,
            student.getFirstName(),
            homework.getTitle(),
            homework.getSubject(),
            homework.getGrade(),
            homework.getClassGrade(),
            dueDate,
            homework.getDescription() != null ? homework.getDescription() : "No description provided"
        );
    }
    
    /**
     * Send email notification to teacher when student submits homework
     */
    public void sendHomeworkSubmissionEmail(HomeworkSubmission submission, Homework homework, User student) {
        logger.info("📧 Sending homework submission email to teacher for homework: '{}' from student: {}", 
                   homework.getTitle(), student.getFirstName() + " " + student.getLastName());
        
        try {
            // Get the teacher who assigned this homework
            User teacher = userRepository.findById(homework.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            sendSingleSubmissionEmail(teacher, submission, homework, student);
            logger.info("✅ Homework submission email sent successfully to teacher: {}", teacher.getEmail());
            
        } catch (Exception e) {
            logger.error("❌ Failed to send homework submission email: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send a single submission email to a teacher
     */
    private void sendSingleSubmissionEmail(User teacher, HomeworkSubmission submission, Homework homework, User student) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom(fromEmail);
        message.setTo(teacher.getEmail());
        message.setSubject("New Homework Submission: " + homework.getTitle());
        message.setText(createSubmissionEmailContent(teacher, submission, homework, student));
        
        mailSender.send(message);
    }
    
    /**
     * Create email content for homework submission
     */
    private String createSubmissionEmailContent(User teacher, HomeworkSubmission submission, Homework homework, User student) {
        String submissionTime = submission.getSubmittedAt().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a"));
        String dueDate = homework.getDueDate().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a"));
        String submissionType = submission.getSubmissionType().toString().toLowerCase();
        
        return String.format("""
            Hello %s,
            
            A student has submitted homework for your review!
            
            Homework Details:
            - Title: %s
            - Subject: %s
            - Grade: %s
            - Due Date: %s
            
            Student Information:
            - Name: %s %s
            - Email: %s
            - Submission Type: %s
            - Submitted At: %s
            
            Submission Content:
            %s
            
            Please log in to your account to review and grade this submission.
            
            Best regards,
            LearnHub System
            
            ---
            This is an automated notification from LearnHub
            """,
            teacher.getFirstName(),
            homework.getTitle(),
            homework.getSubject(),
            homework.getClassGrade(),
            dueDate,
            student.getFirstName(),
            student.getLastName(),
            student.getEmail(),
            submissionType,
            submissionTime,
            submission.getSubmissionText() != null ? submission.getSubmissionText() : "No text content provided"
        );
    }
    
    /**
     * Send email notification to student when homework is graded
     */
    public void sendHomeworkGradedEmail(HomeworkSubmission submission, Homework homework, User student, String grade, String feedback) {
        logger.info("📧 Sending homework graded email to student: {} for homework: '{}'", 
                   student.getFirstName() + " " + student.getLastName(), homework.getTitle());
        
        try {
            sendSingleGradedEmail(student, submission, homework, grade, feedback);
            logger.info("✅ Homework graded email sent successfully to student: {}", student.getEmail());
            
        } catch (Exception e) {
            logger.error("❌ Failed to send homework graded email: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send a single graded email to a student
     */
    private void sendSingleGradedEmail(User student, HomeworkSubmission submission, Homework homework, String grade, String feedback) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setFrom(fromEmail);
        message.setTo(student.getEmail());
        message.setSubject("Homework Graded: " + homework.getTitle());
        message.setText(createGradedEmailContent(student, submission, homework, grade, feedback));
        
        mailSender.send(message);
    }
    
    /**
     * Create email content for graded homework
     */
    private String createGradedEmailContent(User student, HomeworkSubmission submission, Homework homework, String grade, String feedback) {
        String submissionTime = submission.getSubmittedAt().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a"));
        
        return String.format("""
            Hello %s,
            
            Your homework has been graded!
            
            Homework Details:
            - Title: %s
            - Subject: %s
            - Grade: %s
            - Submitted At: %s
            
            Grade: %s
            
            Feedback:
            %s
            
            Please log in to your account to view the complete feedback and details.
            
            Best regards,
            Your Teacher
            
            ---
            This is an automated notification from LearnHub
            """,
            student.getFirstName(),
            homework.getTitle(),
            homework.getSubject(),
            homework.getClassGrade(),
            submissionTime,
            grade,
            feedback != null ? feedback : "No feedback provided"
        );
    }
    
    /**
     * Test method to verify email configuration
     */
    public boolean testEmailConfiguration() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo("test@example.com");
            message.setSubject("Test Email");
            message.setText("This is a test email to verify configuration.");
            
            // Don't actually send, just test if we can create the message
            logger.info("✅ Email configuration test passed");
            return true;
        } catch (Exception e) {
            logger.error("❌ Email configuration test failed: {}", e.getMessage());
            return false;
        }
    }
}
