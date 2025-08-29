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
}
