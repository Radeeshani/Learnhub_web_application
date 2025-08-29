package com.homework.service;

import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.entity.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${email.from}")
    private String fromEmail;
    
    @Value("${email.templates.new-homework}")
    private String newHomeworkSubject;
    
    @Value("${email.templates.due-soon}")
    private String dueSoonSubject;
    
    @Value("${email.templates.overdue}")
    private String overdueSubject;
    
    @Value("${email.templates.graded}")
    private String gradedSubject;
    
    @Value("${email.templates.submission}")
    private String submissionSubject;
    
    /**
     * Send email notification for new homework assignment
     */
    public void sendNewHomeworkNotification(User user, Homework homework) {
        try {
            logger.info("🔄 Attempting to send new homework notification email to: {}", user.getEmail());
            logger.info("📧 Email details - From: {}, To: {}, Subject template: {}", fromEmail, user.getEmail(), newHomeworkSubject);
            
            String subject = newHomeworkSubject.replace("{title}", homework.getTitle());
            String htmlContent = createNewHomeworkEmail(user, homework);
            
            logger.info("📝 Email content prepared - Subject: '{}', Content length: {} characters", subject, htmlContent.length());
            
            sendEmail(user.getEmail(), subject, htmlContent);
            
            logger.info("✅ New homework notification email sent successfully to: {}", user.getEmail());
            logger.info("📊 Email Summary - User: {} ({}), Homework: '{}', Subject: '{}'", 
                user.getFirstName() + " " + user.getLastName(), user.getEmail(), homework.getTitle(), subject);
            
        } catch (Exception e) {
            logger.error("❌ Failed to send new homework notification email to: {}", user.getEmail(), e);
            logger.error("🔍 Error details - Type: {}, Message: {}", e.getClass().getSimpleName(), e.getMessage());
            
            // Log additional debugging information
            if (e instanceof MessagingException) {
                MessagingException me = (MessagingException) e;
                logger.error("📧 MessagingException details - Exception: {}", me.getLocalizedMessage());
            }
        }
    }
    
    /**
     * Send email notification for homework due soon
     */
    public void sendDueSoonNotification(User user, Homework homework) {
        try {
            logger.info("🔄 Attempting to send due soon notification email to: {}", user.getEmail());
            
            String subject = dueSoonSubject.replace("{title}", homework.getTitle());
            String htmlContent = createDueSoonEmail(user, homework);
            
            sendEmail(user.getEmail(), subject, htmlContent);
            logger.info("✅ Due soon notification email sent successfully to: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("❌ Failed to send due soon notification email to: {}", user.getEmail(), e);
        }
    }
    
    /**
     * Send email notification for overdue homework
     */
    public void sendOverdueNotification(User user, Homework homework) {
        try {
            logger.info("🔄 Attempting to send overdue notification email to: {}", user.getEmail());
            
            String subject = overdueSubject.replace("{title}", homework.getTitle());
            String htmlContent = createOverdueEmail(user, homework);
            
            sendEmail(user.getEmail(), subject, htmlContent);
            logger.info("✅ Overdue notification email sent successfully to: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("❌ Failed to send overdue notification email to: {}", user.getEmail(), e);
        }
    }
    
    /**
     * Send email notification for graded homework
     */
    public void sendGradedNotification(User user, Homework homework, String grade, String feedback) {
        try {
            logger.info("🔄 Attempting to send graded notification email to: {}", user.getEmail());
            
            String subject = gradedSubject.replace("{title}", homework.getTitle());
            String htmlContent = createGradedEmail(user, homework, grade, feedback);
            
            sendEmail(user.getEmail(), subject, htmlContent);
            logger.info("✅ Graded notification email sent successfully to: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("❌ Failed to send graded notification email to: {}", user.getEmail(), e);
        }
    }
    
    /**
     * Send email notification for homework submission received
     */
    public void sendSubmissionNotification(User user, Homework homework) {
        try {
            logger.info("🔄 Attempting to send submission notification email to: {}", user.getEmail());
            
            String subject = submissionSubject.replace("{title}", homework.getTitle());
            String htmlContent = createSubmissionEmail(user, homework);
            
            sendEmail(user.getEmail(), subject, htmlContent);
            logger.info("✅ Submission notification email sent successfully to: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("❌ Failed to send submission notification email to: {}", user.getEmail(), e);
        }
    }
    
    /**
     * Send a general notification email
     */
    public void sendGeneralNotification(User user, String subject, String message) {
        try {
            logger.info("🔄 Attempting to send general notification email to: {}", user.getEmail());
            
            String htmlContent = createGeneralEmail(user, subject, message);
            sendEmail(user.getEmail(), subject, htmlContent);
            logger.info("✅ General notification email sent successfully to: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("❌ Failed to send general notification email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Debug method to check email template values
     */
    public Map<String, String> getEmailTemplateValues() {
        Map<String, String> templates = new HashMap<>();
        templates.put("fromEmail", fromEmail);
        templates.put("newHomeworkSubject", newHomeworkSubject);
        templates.put("dueSoonSubject", dueSoonSubject);
        templates.put("overdueSubject", overdueSubject);
        templates.put("gradedSubject", gradedSubject);
        templates.put("submissionSubject", submissionSubject);
        return templates;
    }
    
    /**
     * Send the actual email with enhanced logging
     */
    private void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        logger.info("📤 Starting email send process...");
        logger.info("📧 Email details - To: {}, Subject: '{}', Content length: {} chars", to, subject, htmlContent.length());
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML content
            
            logger.info("📝 MimeMessage created successfully");
            logger.info("📤 Attempting to send email via JavaMailSender...");
            
            mailSender.send(message);
            
            logger.info("✅ Email sent successfully via JavaMailSender");
            logger.info("📊 Email delivery confirmed - To: {}, Subject: '{}', From: {}", to, subject, fromEmail);
            
        } catch (MessagingException e) {
            logger.error("❌ MessagingException occurred while sending email to: {}", to, e);
            logger.error("🔍 MessagingException details - Exception: {}, Localized: {}", 
                e.getMessage(), e.getLocalizedMessage());
            throw e;
        } catch (Exception e) {
            logger.error("❌ Unexpected error occurred while sending email to: {}", to, e);
            logger.error("🔍 Error details - Type: {}, Message: {}", e.getClass().getSimpleName(), e.getMessage());
            throw new MessagingException("Failed to send email: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create HTML email content for new homework
     */
    private String createNewHomeworkEmail(User user, Homework homework) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Homework Assignment</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .homework-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .due-date { color: #e74c3c; font-weight: bold; }
                    .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📚 New Homework Assignment</h1>
                        <p>Hello %s, you have a new homework assignment!</p>
                    </div>
                    <div class="content">
                        <div class="homework-card">
                            <h2>%s</h2>
                            <p><strong>Subject:</strong> %s</p>
                            <p><strong>Description:</strong> %s</p>
                            <p class="due-date"><strong>Due Date:</strong> %s</p>
                            <p><strong>Class:</strong> %s</p>
                        </div>
                        <a href="http://localhost:3000/student" class="btn">View Homework</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from LearnHub</p>
                        <p>© 2024 LearnHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                user.getFirstName(),
                homework.getTitle(),
                homework.getSubject(),
                homework.getDescription(),
                formatDate(homework.getDueDate()),
                homework.getClassGrade()
            );
    }
    
    /**
     * Create HTML email content for due soon notification
     */
    private String createDueSoonEmail(User user, Homework homework) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Homework Due Soon</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .homework-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39c12; }
                    .due-date { color: #e74c3c; font-weight: bold; }
                    .btn { display: inline-block; padding: 12px 24px; background: #f39c12; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ Homework Due Soon</h1>
                        <p>Hello %s, don't forget to submit your homework!</p>
                    </div>
                    <div class="content">
                        <div class="homework-card">
                            <h2>%s</h2>
                            <p><strong>Subject:</strong> %s</p>
                            <p><strong>Description:</strong> %s</p>
                            <p class="due-date"><strong>Due Date:</strong> %s</p>
                            <p><strong>Class:</strong> %s</p>
                        </div>
                        <a href="http://localhost:3000/student" class="btn">Submit Now</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from LearnHub</p>
                        <p>© 2024 LearnHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                user.getFirstName(),
                homework.getTitle(),
                homework.getSubject(),
                homework.getDescription(),
                formatDate(homework.getDueDate()),
                homework.getClassGrade()
            );
    }
    
    /**
     * Create HTML email content for overdue notification
     */
    private String createOverdueEmail(User user, Homework homework) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Homework Overdue</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .homework-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c; }
                    .due-date { color: #e74c3c; font-weight: bold; }
                    .btn { display: inline-block; padding: 12px 24px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚨 Homework Overdue</h1>
                        <p>Hello %s, your homework is overdue!</p>
                    </div>
                    <div class="content">
                        <div class="homework-card">
                            <h2>%s</h2>
                            <p><strong>Subject:</strong> %s</p>
                            <p><strong>Description:</strong> %s</p>
                            <p class="due-date"><strong>Due Date:</strong> %s</p>
                            <p><strong>Class:</strong> %s</p>
                        </div>
                        <a href="http://localhost:3000/student" class="btn">Submit Immediately</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from LearnHub</p>
                        <p>© 2024 LearnHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                user.getFirstName(),
                homework.getTitle(),
                homework.getSubject(),
                homework.getDescription(),
                formatDate(homework.getDueDate()),
                homework.getClassGrade()
            );
    }
    
    /**
     * Create HTML email content for graded homework
     */
    private String createGradedEmail(User user, Homework homework, String grade, String feedback) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Homework Graded</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .homework-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60; }
                    .grade { font-size: 24px; font-weight: bold; color: #27ae60; }
                    .btn { display: inline-block; padding: 12px 24px; background: #27ae60; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Homework Graded</h1>
                        <p>Hello %s, your homework has been graded!</p>
                    </div>
                    <div class="content">
                        <div class="homework-card">
                            <h2>%s</h2>
                            <p><strong>Subject:</strong> %s</p>
                            <p><strong>Grade:</strong> <span class="grade">%s</span></p>
                            <p><strong>Feedback:</strong> %s</p>
                            <p><strong>Class:</strong> %s</p>
                        </div>
                        <a href="http://localhost:3000/student" class="btn">View Details</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from LearnHub</p>
                        <p>© 2024 LearnHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                user.getFirstName(),
                homework.getTitle(),
                homework.getSubject(),
                grade,
                feedback != null ? feedback : "No feedback provided",
                homework.getClassGrade()
            );
    }
    
    /**
     * Create HTML email content for submission notification
     */
    private String createSubmissionEmail(User user, Homework homework) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Homework Submission Received</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .homework-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db; }
                    .btn { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📝 Homework Submission Received</h1>
                        <p>Hello %s, your homework submission has been received!</p>
                    </div>
                    <div class="content">
                        <div class="homework-card">
                            <h2>%s</h2>
                            <p><strong>Subject:</strong> %s</p>
                            <p><strong>Description:</strong> %s</p>
                            <p><strong>Class:</strong> %s</p>
                            <p><strong>Submission Time:</strong> %s</p>
                        </div>
                        <a href="http://localhost:3000/student" class="btn">View Submission</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from LearnHub</p>
                        <p>© 2024 LearnHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                user.getFirstName(),
                homework.getTitle(),
                homework.getSubject(),
                homework.getDescription(),
                homework.getClassGrade(),
                formatDate(LocalDateTime.now())
            );
    }
    
    /**
     * Create HTML email content for general notifications
     */
    private String createGeneralEmail(User user, String subject, String message) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .message-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9b59b6; }
                    .btn { display: inline-block; padding: 12px 24px; background: #9b59b6; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📢 %s</h1>
                        <p>Hello %s, you have a new notification!</p>
                    </div>
                    <div class="content">
                        <div class="message-card">
                            <p>%s</p>
                        </div>
                        <a href="http://localhost:3000" class="btn">View Details</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from LearnHub</p>
                        <p>© 2024 LearnHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(subject, subject, user.getFirstName(), message);
    }
    
    /**
     * Format date for display
     */
    private String formatDate(LocalDateTime date) {
        if (date == null) return "Not specified";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");
        return date.format(formatter);
    }
}
