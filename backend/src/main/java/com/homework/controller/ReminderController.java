package com.homework.controller;

import com.homework.entity.Reminder;
import com.homework.dto.ReminderResponse;
import com.homework.service.ReminderService;
import com.homework.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/homework/reminders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ReminderController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReminderController.class);
    
    @Autowired
    private ReminderService reminderService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    /**
     * Get all reminders for the current user
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUserReminders(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            // Get both pending reminders and processed reminder notifications
            List<ReminderResponse> reminders = reminderService.getUserRemindersWithNotifications(userId);
            
            return ResponseEntity.ok(reminders);
        } catch (Exception e) {
            logger.error("Error getting user reminders", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get reminders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get unread reminders for the current user
     */
    @GetMapping("/user/unread")
    public ResponseEntity<?> getUserUnreadReminders(@RequestHeader("Authorization") String authHeader) {
        try {
            logger.debug("Received request for unread reminders with auth header: {}", authHeader != null ? authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "null");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            logger.debug("Extracted token: {}", token.substring(0, Math.min(20, token.length())) + "...");
            
            if (!jwtTokenProvider.validateToken(token)) {
                logger.debug("Token validation failed");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            logger.debug("Extracted user ID: {}", userId);
            
            List<ReminderResponse> reminders = reminderService.getUserUnreadReminders(userId);
            logger.debug("Found {} unread reminders for user {}", reminders.size(), userId);
            
            return ResponseEntity.ok(reminders);
        } catch (Exception e) {
            logger.error("Error getting user unread reminders", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get unread reminders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Mark a reminder as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markReminderAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            Reminder reminder = reminderService.markReminderAsRead(id);
            if (reminder == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Reminder not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            return ResponseEntity.ok(reminder);
        } catch (Exception e) {
            logger.error("Error marking reminder as read", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to mark reminder as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Mark all reminders as read for the current user
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllRemindersAsRead(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            reminderService.markAllRemindersAsRead(userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "All reminders marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error marking all reminders as read", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to mark all reminders as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get reminder count for the current user
     */
    @GetMapping("/user/count")
    public ResponseEntity<?> getReminderCount(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            List<ReminderResponse> unreadReminders = reminderService.getUserUnreadReminders(userId);
            long count = unreadReminders.size();
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("reminders", unreadReminders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting reminder count", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get reminder count: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // REMOVED: Custom reminder creation endpoint
    // Smart reminders are now automatically created and managed by the system
    // This prevents duplicate notifications and provides better UX

    /**
     * Test endpoint to check if reminders are working
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Reminder endpoints are working!");
    }
    
    /**
     * Test endpoint to manually trigger reminder processing
     */
    @GetMapping("/test/process")
    public ResponseEntity<String> testProcessReminders() {
        try {
            // Manually trigger the reminder processing
            reminderService.processPendingReminders();
            return ResponseEntity.ok("Reminder processing triggered successfully!");
        } catch (Exception e) {
            logger.error("Error testing reminder processing", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error testing reminder processing: " + e.getMessage());
        }
    }
}
