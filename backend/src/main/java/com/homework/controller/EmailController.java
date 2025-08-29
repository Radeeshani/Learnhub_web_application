package com.homework.controller;

import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.service.EmailService;
import com.homework.service.UserService;
import com.homework.service.HomeworkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import com.homework.enums.UserRole;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import com.homework.service.NotificationService;

@RestController
@RequestMapping("/email")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class EmailController {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private HomeworkService homeworkService;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private NotificationService notificationService;

    @Value("${email.from}")
    private String fromEmail;
    
    /**
     * Test endpoint to send a new homework notification email
     */
    @PostMapping("/test/new-homework")
    public ResponseEntity<?> testNewHomeworkEmail(@RequestParam Long userId, @RequestParam Long homeworkId) {
        try {
            User user = userService.getUserById(userId);
            Homework homework = homeworkService.getHomework(homeworkId);
            
            if (user == null || homework == null) {
                return ResponseEntity.badRequest().body("User or homework not found");
            }
            
            emailService.sendNewHomeworkNotification(user, homework);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "New homework notification email sent successfully");
            response.put("user", user.getEmail());
            response.put("homework", homework.getTitle());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to send new homework notification email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send email: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Test endpoint to send a due soon notification email
     */
    @PostMapping("/test/due-soon")
    public ResponseEntity<?> testDueSoonEmail(@RequestParam Long userId, @RequestParam Long homeworkId) {
        try {
            User user = userService.getUserById(userId);
            Homework homework = homeworkService.getHomework(homeworkId);
            
            if (user == null || homework == null) {
                return ResponseEntity.badRequest().body("User or homework not found");
            }
            
            emailService.sendDueSoonNotification(user, homework);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Due soon notification email sent successfully");
            response.put("user", user.getEmail());
            response.put("homework", homework.getTitle());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to send due soon notification email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send email: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Test endpoint to send an overdue notification email
     */
    @PostMapping("/test/overdue")
    public ResponseEntity<?> testOverdueEmail(@RequestParam Long userId, @RequestParam Long homeworkId) {
        try {
            User user = userService.getUserById(userId);
            Homework homework = homeworkService.getHomework(homeworkId);
            
            if (user == null || homework == null) {
                return ResponseEntity.badRequest().body("User or homework not found");
            }
            
            emailService.sendOverdueNotification(user, homework);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Overdue notification email sent successfully");
            response.put("user", user.getEmail());
            response.put("homework", homework.getTitle());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to send overdue notification email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send email: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Test endpoint to send a graded notification email
     */
    @PostMapping("/test/graded")
    public ResponseEntity<?> testGradedEmail(
            @RequestParam Long userId, 
            @RequestParam Long homeworkId,
            @RequestParam String grade,
            @RequestParam(required = false) String feedback) {
        try {
            User user = userService.getUserById(userId);
            Homework homework = homeworkService.getHomework(homeworkId);
            
            if (user == null || homework == null) {
                return ResponseEntity.badRequest().body("User or homework not found");
            }
            
            emailService.sendGradedNotification(user, homework, grade, feedback);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Graded notification email sent successfully");
            response.put("user", user.getEmail());
            response.put("homework", homework.getTitle());
            response.put("grade", grade);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to send graded notification email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send email: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Test endpoint to send a submission notification email
     */
    @PostMapping("/test/submission")
    public ResponseEntity<?> testSubmissionEmail(@RequestParam Long userId, @RequestParam Long homeworkId) {
        try {
            User user = userService.getUserById(userId);
            Homework homework = homeworkService.getHomework(homeworkId);
            
            if (user == null || homework == null) {
                return ResponseEntity.badRequest().body("User or homework not found");
            }
            
            emailService.sendSubmissionNotification(user, homework);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Submission notification email sent successfully");
            response.put("user", user.getEmail());
            response.put("homework", homework.getTitle());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to send submission notification email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send email: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Test endpoint to send a general notification email
     */
    @PostMapping("/test/general")
    public ResponseEntity<?> testGeneralEmail(
            @RequestParam Long userId,
            @RequestParam String subject,
            @RequestParam String message) {
        try {
            User user = userService.getUserById(userId);
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            emailService.sendGeneralNotification(user, subject, message);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "General notification email sent successfully");
            response.put("user", user.getEmail());
            response.put("subject", subject);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to send general notification email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send email: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Test endpoint to check email service status
     */
    @GetMapping("/test/status")
    public ResponseEntity<?> testEmailServiceStatus() {
        try {
            Map<String, String> response = new HashMap<>();
            response.put("status", "Email service is running");
            response.put("message", "Email service is ready to send notifications");
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Email service status check failed", e);
            Map<String, String> error = new HashMap<>();
            error.put("status", "Email service error");
            error.put("message", "Failed to check email service status: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Simple email test endpoint to debug email issues
     */
    @PostMapping("/test/simple")
    public ResponseEntity<?> testSimpleEmail(@RequestParam String toEmail) {
        try {
            // Create a simple test email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Test Email from Homework Application");
            helper.setText("This is a test email to verify the email configuration is working correctly.", false);
            
            mailSender.send(message);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Simple test email sent successfully");
            response.put("to", toEmail);
            response.put("from", fromEmail);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to send simple test email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send test email: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Debug endpoint to test NotificationService step by step
     */
    @PostMapping("/test/debug-notification")
    public ResponseEntity<?> testDebugNotification(@RequestParam Long homeworkId) {
        try {
            Map<String, Object> debugInfo = new HashMap<>();
            
            // Step 1: Get homework
            Homework homework = homeworkService.getHomework(homeworkId);
            if (homework == null) {
                debugInfo.put("error", "Homework not found");
                return ResponseEntity.badRequest().body(debugInfo);
            }
            debugInfo.put("homework", homework.getTitle());
            
            // Step 2: Get all students
            List<User> students = userService.getUsersByRole(UserRole.STUDENT);
            debugInfo.put("totalStudents", students.size());
            debugInfo.put("students", students.stream()
                .map(user -> user.getEmail())
                .collect(Collectors.toList()));
            
            // Step 3: Test email service directly
            List<String> emailResults = new ArrayList<>();
            for (User student : students) {
                try {
                    emailService.sendNewHomeworkNotification(student, homework);
                    emailResults.add("SUCCESS: " + student.getEmail());
                } catch (Exception e) {
                    emailResults.add("FAILED: " + student.getEmail() + " - " + e.getMessage());
                }
            }
            debugInfo.put("emailResults", emailResults);
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Debug test failed: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Test endpoint to directly test NotificationService
     */
    @PostMapping("/test/notification-service")
    public ResponseEntity<?> testNotificationService(@RequestParam Long homeworkId) {
        try {
            Map<String, Object> debugInfo = new HashMap<>();
            
            // Step 1: Get homework
            Homework homework = homeworkService.getHomework(homeworkId);
            if (homework == null) {
                debugInfo.put("error", "Homework not found");
                return ResponseEntity.badRequest().body(debugInfo);
            }
            debugInfo.put("homework", homework.getTitle());
            
            // Step 2: Test NotificationService directly
            try {
                notificationService.createNewHomeworkNotification(homework);
                debugInfo.put("notificationServiceTest", "SUCCESS - NotificationService.createNewHomeworkNotification() called successfully");
            } catch (Exception e) {
                debugInfo.put("notificationServiceError", e.getMessage());
                debugInfo.put("notificationServiceErrorType", e.getClass().getSimpleName());
            }
            
            // Step 3: Test EmailService directly with a student
            List<User> students = userService.getUsersByRole(UserRole.STUDENT);
            if (!students.isEmpty()) {
                User testStudent = students.get(0);
                try {
                    emailService.sendNewHomeworkNotification(testStudent, homework);
                    debugInfo.put("emailServiceTest", "SUCCESS - Email sent to " + testStudent.getEmail());
                } catch (Exception e) {
                    debugInfo.put("emailServiceError", e.getMessage());
                }
            }
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Notification service test failed: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Test endpoint to test EmailService template injection
     */
    @GetMapping("/test/email-templates")
    public ResponseEntity<?> testEmailTemplates() {
        try {
            Map<String, Object> debugInfo = new HashMap<>();
            
            // Test if email templates are properly injected
            Map<String, String> templates = emailService.getEmailTemplateValues();
            debugInfo.putAll(templates);
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email templates test failed: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Comprehensive email testing and debugging endpoint
     */
    @PostMapping("/test/comprehensive")
    public ResponseEntity<?> testComprehensiveEmail(@RequestParam String toEmail) {
        try {
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("timestamp", java.time.LocalDateTime.now().toString());
            debugInfo.put("testEmail", toEmail);
            debugInfo.put("fromEmail", fromEmail);
            
            // Step 1: Test basic email configuration
            debugInfo.put("step1", "Testing basic email configuration");
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("🔍 Email System Test - Configuration Check");
                helper.setText("This is a test email to verify the email configuration is working correctly.", false);
                
                mailSender.send(message);
                debugInfo.put("step1Result", "SUCCESS - Basic email configuration is working");
                debugInfo.put("step1Details", "MimeMessage created and sent successfully");
            } catch (Exception e) {
                debugInfo.put("step1Result", "FAILED - Basic email configuration error");
                debugInfo.put("step1Error", e.getMessage());
                debugInfo.put("step1ErrorType", e.getClass().getSimpleName());
            }
            
            // Step 2: Test HTML email
            debugInfo.put("step2", "Testing HTML email delivery");
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("🔍 Email System Test - HTML Email");
                
                String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Email System Test</title>
                    </head>
                    <body>
                        <h1>🎯 Email System Test</h1>
                        <p>This is a test HTML email to verify:</p>
                        <ul>
                            <li>✅ HTML email support</li>
                            <li>✅ UTF-8 encoding</li>
                            <li>✅ Email delivery</li>
                        </ul>
                        <p><strong>Test Time:</strong> %s</p>
                        <p><strong>From:</strong> %s</p>
                        <p><strong>To:</strong> %s</p>
                    </body>
                    </html>
                    """.formatted(java.time.LocalDateTime.now().toString(), fromEmail, toEmail);
                
                helper.setText(htmlContent, true);
                mailSender.send(message);
                debugInfo.put("step2Result", "SUCCESS - HTML email sent successfully");
                debugInfo.put("step2Details", "HTML email with UTF-8 encoding delivered");
            } catch (Exception e) {
                debugInfo.put("step2Result", "FAILED - HTML email error");
                debugInfo.put("step2Error", e.getMessage());
                debugInfo.put("step2ErrorType", e.getClass().getSimpleName());
            }
            
            // Step 3: Test with different subject formats
            debugInfo.put("step3", "Testing subject line formatting");
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("🔍 Test: Special Characters & Emojis 🎉 📚 ✨");
                helper.setText("Testing email with special characters and emojis in subject line.", false);
                
                mailSender.send(message);
                debugInfo.put("step3Result", "SUCCESS - Special characters in subject line");
                debugInfo.put("step3Details", "Email with emojis and special characters sent");
            } catch (Exception e) {
                debugInfo.put("step3Result", "FAILED - Special characters error");
                debugInfo.put("step3Error", e.getMessage());
                debugInfo.put("step3ErrorType", e.getClass().getSimpleName());
            }
            
            // Step 4: Test email template system
            debugInfo.put("step4", "Testing email template system");
            try {
                Map<String, String> templates = emailService.getEmailTemplateValues();
                debugInfo.put("step4Result", "SUCCESS - Email templates loaded");
                debugInfo.put("step4Templates", templates);
            } catch (Exception e) {
                debugInfo.put("step4Result", "FAILED - Email template error");
                debugInfo.put("step4Error", e.getMessage());
                debugInfo.put("step4ErrorType", e.getClass().getSimpleName());
            }
            
            // Step 5: Test notification service
            debugInfo.put("step5", "Testing notification service");
            try {
                List<User> students = userService.getUsersByRole(UserRole.STUDENT);
                debugInfo.put("step5Result", "SUCCESS - Notification service accessible");
                debugInfo.put("step5StudentCount", students.size());
                debugInfo.put("step5Students", students.stream()
                    .map(user -> user.getEmail())
                    .collect(Collectors.toList()));
            } catch (Exception e) {
                debugInfo.put("step5Result", "FAILED - Notification service error");
                debugInfo.put("step5Error", e.getMessage());
                debugInfo.put("step5ErrorType", e.getClass().getSimpleName());
            }
            
            debugInfo.put("message", "Comprehensive email test completed");
            debugInfo.put("recommendations", getEmailRecommendations(debugInfo));
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Comprehensive email test failed: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Generate email recommendations based on test results
     */
    private List<String> getEmailRecommendations(Map<String, Object> debugInfo) {
        List<String> recommendations = new ArrayList<>();
        
        if (debugInfo.containsKey("step1Result") && debugInfo.get("step1Result").toString().contains("SUCCESS")) {
            recommendations.add("✅ Basic email configuration is working correctly");
        } else {
            recommendations.add("❌ Check SMTP configuration in application.yml");
            recommendations.add("❌ Verify Gmail app password is correct");
            recommendations.add("❌ Ensure Gmail 2-factor authentication is enabled");
        }
        
        if (debugInfo.containsKey("step2Result") && debugInfo.get("step2Result").toString().contains("SUCCESS")) {
            recommendations.add("✅ HTML email delivery is working");
        } else {
            recommendations.add("❌ Check email encoding and HTML support");
        }
        
        if (debugInfo.containsKey("step3Result") && debugInfo.get("step3Result").toString().contains("SUCCESS")) {
            recommendations.add("✅ Special characters and emojis are supported");
        } else {
            recommendations.add("❌ Check email client compatibility");
        }
        
        recommendations.add("📧 Check spam/junk folders for test emails");
        recommendations.add("📧 Verify email addresses are correct");
        recommendations.add("📧 Test with different email providers");
        recommendations.add("📧 Check Gmail sending limits and restrictions");
        
        return recommendations;
    }

    /**
     * Test endpoint to send a specific email and show delivery details
     */
    @PostMapping("/test/send-specific-email")
    public ResponseEntity<?> testSpecificEmailDelivery(@RequestParam String toEmail, @RequestParam String subject, @RequestParam String message) {
        try {
            logger.info("🧪 TESTING SPECIFIC EMAIL DELIVERY");
            logger.info("📧 Sending email to: {}", toEmail);
            logger.info("📝 Subject: {}", subject);
            logger.info("📄 Message: {}", message);
            
            // Create a simple HTML email
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Test Email</title>
                </head>
                <body>
                    <h2>🧪 Test Email from Homework Application</h2>
                    <p><strong>To:</strong> %s</p>
                    <p><strong>Subject:</strong> %s</p>
                    <p><strong>Message:</strong> %s</p>
                    <p><strong>Timestamp:</strong> %s</p>
                    <hr>
                    <p>This is a test email to verify email delivery functionality.</p>
                    <p>If you receive this email, the email system is working correctly.</p>
                </body>
                </html>
                """.formatted(toEmail, subject, message, java.time.LocalDateTime.now().toString());
            
            // Send the email
            emailService.sendGeneralNotification(new User() {{
                setEmail(toEmail);
                setFirstName("Test");
                setLastName("User");
            }}, subject, message);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test email sent successfully");
            response.put("toEmail", toEmail);
            response.put("subject", subject);
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            response.put("emailContent", htmlContent);
            
            logger.info("✅ Test email sent successfully to: {}", toEmail);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Test email failed", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Test email failed: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
