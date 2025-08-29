package com.homework.controller;

import com.homework.entity.Notification;
import com.homework.service.NotificationService;
import com.homework.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/homework/notifications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class NotificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    // Get all notifications for the current user
    @GetMapping("/user")
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Failed to get user notifications", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get unread notifications for the current user
    @GetMapping("/user/unread")
    public ResponseEntity<List<Notification>> getUserUnreadNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            List<Notification> notifications = notificationService.getUserUnreadNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Failed to get unread notifications", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            logger.error("Failed to mark notification as read", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Mark all notifications as read for the current user
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to mark all notifications as read", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            notificationService.deleteNotification(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to delete notification", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Clear all notifications for the current user
    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAllNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            notificationService.clearAllNotifications(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to clear all notifications", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get notification count for the current user
    @GetMapping("/user/count")
    public ResponseEntity<Long> getNotificationCount(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            long count = notificationService.getUserUnreadNotifications(userId).size();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            logger.error("Failed to get notification count", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Test endpoint to create sample notifications
    @PostMapping("/test/create")
    public ResponseEntity<Notification> createTestNotification(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            Notification notification = notificationService.createNotification(
                userId, 
                Notification.NotificationType.NEW_HOMEWORK,
                "Test Notification",
                "This is a test notification to verify the system is working",
                1L,
                "Test Homework",
                Notification.NotificationPriority.NORMAL
            );
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            logger.error("Failed to create test notification", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Test endpoint to create multiple test notifications
    @PostMapping("/test/create-multiple")
    public ResponseEntity<List<Notification>> createMultipleTestNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            
            String token = authHeader.substring(7);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(null);
            }
            
            List<Notification> notifications = new ArrayList<>();
            
            // Create different types of test notifications
            notifications.add(notificationService.createNotification(
                userId, 
                Notification.NotificationType.NEW_HOMEWORK,
                "New Math Homework",
                "You have a new math homework assignment due next week",
                1L,
                "Algebra Practice",
                Notification.NotificationPriority.NORMAL
            ));
            
            notifications.add(notificationService.createNotification(
                userId, 
                Notification.NotificationType.DUE_SOON,
                "Science Project Due Soon",
                "Your science project is due in 2 days",
                2L,
                "Ecosystem Model",
                Notification.NotificationPriority.HIGH
            ));
            
            notifications.add(notificationService.createNotification(
                userId, 
                Notification.NotificationType.GRADED,
                "English Essay Graded",
                "Your English essay has been graded. Check your dashboard for details",
                3L,
                "Shakespeare Analysis",
                Notification.NotificationPriority.NORMAL
            ));
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Failed to create multiple test notifications", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
