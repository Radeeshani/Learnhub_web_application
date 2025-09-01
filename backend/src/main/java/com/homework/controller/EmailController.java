package com.homework.controller;

import com.homework.service.EmailService;
import com.homework.service.UserService;
import com.homework.service.HomeworkService;
import com.homework.service.HomeworkSubmissionService;
import com.homework.entity.Homework;
import com.homework.entity.HomeworkSubmission;
import com.homework.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

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
    private HomeworkSubmissionService homeworkSubmissionService;
    
    /**
     * Test endpoint to verify email configuration
     */
    @GetMapping("/test-config")
    public ResponseEntity<?> testEmailConfiguration() {
        try {
            boolean configOk = emailService.testEmailConfiguration();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", configOk);
            response.put("message", configOk ? "Email configuration is working" : "Email configuration failed");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to test email configuration", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to test email configuration: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Health check endpoint for email service
     */
    @GetMapping("/health")
    public ResponseEntity<?> emailHealthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Email Service");
        response.put("message", "Email service is running");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Test endpoint to simulate homework submission email
     */
    @PostMapping("/test/submission-email")
    public ResponseEntity<?> testSubmissionEmail(@RequestParam Long homeworkId, @RequestParam Long studentId) {
        try {
            Homework homework = homeworkService.getHomework(homeworkId);
            User student = userService.getUserById(studentId);
            
            if (homework == null || student == null) {
                return ResponseEntity.badRequest().body("Homework or student not found");
            }
            
            // Create a mock submission for testing
            HomeworkSubmission mockSubmission = new HomeworkSubmission();
            mockSubmission.setHomeworkId(homeworkId);
            mockSubmission.setStudentId(studentId);
            mockSubmission.setSubmittedAt(java.time.LocalDateTime.now());
            mockSubmission.setSubmissionType(HomeworkSubmission.SubmissionType.TEXT);
            mockSubmission.setSubmissionText("This is a test submission for email testing.");
            
            // Send the submission email
            emailService.sendHomeworkSubmissionEmail(mockSubmission, homework, student);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Submission email test sent successfully");
            response.put("homework", homework.getTitle());
            response.put("student", student.getFirstName() + " " + student.getLastName());
            response.put("teacher", "Teacher ID: " + homework.getTeacherId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to test submission email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to test submission email: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Test endpoint to simulate homework graded email
     */
    @PostMapping("/test/graded-email")
    public ResponseEntity<?> testGradedEmail(@RequestParam Long homeworkId, @RequestParam Long studentId, 
                                           @RequestParam String grade, @RequestParam String feedback) {
        try {
            Homework homework = homeworkService.getHomework(homeworkId);
            User student = userService.getUserById(studentId);
            
            if (homework == null || student == null) {
                return ResponseEntity.badRequest().body("Homework or student not found");
            }
            
            // Create a mock submission for testing
            HomeworkSubmission mockSubmission = new HomeworkSubmission();
            mockSubmission.setHomeworkId(homeworkId);
            mockSubmission.setStudentId(studentId);
            mockSubmission.setSubmittedAt(java.time.LocalDateTime.now());
            mockSubmission.setSubmissionType(HomeworkSubmission.SubmissionType.TEXT);
            
            // Send the graded email
            emailService.sendHomeworkGradedEmail(mockSubmission, homework, student, grade, feedback);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Graded email test sent successfully");
            response.put("homework", homework.getTitle());
            response.put("student", student.getFirstName() + " " + student.getLastName());
            response.put("grade", grade);
            response.put("feedback", feedback);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to test graded email", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to test graded email: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
