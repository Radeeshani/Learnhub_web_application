package com.homework.controller;

import com.homework.entity.Notification;
import com.homework.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    // Get all notifications for the current user (temporary endpoint for testing)
    @GetMapping("/user")
    public ResponseEntity<List<Notification>> getUserNotifications() {
        try {
            // For now, return notifications for user ID 1 (first student)
            // In a real system, this would extract user ID from JWT token
            List<Notification> notifications = notificationService.getUserNotifications(1L);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get unread notifications for the current user
    @GetMapping("/user/unread")
    public ResponseEntity<List<Notification>> getUserUnreadNotifications() {
        try {
            // For now, return unread notifications for user ID 1
            List<Notification> notifications = notificationService.getUserUnreadNotifications(1L);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        try {
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Mark all notifications as read for the current user
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead() {
        try {
            // For now, mark all as read for user ID 1
            notificationService.markAllAsRead(1L);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Clear all notifications for the current user
    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAllNotifications() {
        try {
            // For now, clear all for user ID 1
            notificationService.clearAllNotifications(1L);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get notification count for the current user
    @GetMapping("/user/count")
    public ResponseEntity<Long> getNotificationCount() {
        try {
            // For now, return count for user ID 1
            long count = notificationService.getUserUnreadNotifications(1L).size();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Test endpoint to create sample notifications
    @PostMapping("/test/create")
    public ResponseEntity<Notification> createTestNotification() {
        try {
            Notification notification = notificationService.createNotification(
                1L, 
                Notification.NotificationType.NEW_HOMEWORK,
                "Test Notification",
                "This is a test notification",
                1L,
                "Test Homework",
                Notification.NotificationPriority.NORMAL
            );
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
