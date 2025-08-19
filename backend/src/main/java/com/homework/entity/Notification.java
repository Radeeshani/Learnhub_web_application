package com.homework.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "homework_id")
    private Long homeworkId;
    
    @Column(name = "homework_title")
    private String homeworkTitle;
    
    @Column(name = "read_status", nullable = false)
    private boolean read = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "priority", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationPriority priority = NotificationPriority.NORMAL;
    
    @Column(name = "action_url")
    private String actionUrl;
    
    @Column(name = "action_text")
    private String actionText;
    
    public enum NotificationType {
        DUE_SOON,           // Homework due soon
        OVERDUE,            // Homework overdue
        GRADED,             // Homework graded
        NEW_HOMEWORK,       // New homework assigned
        SUBMISSION_RECEIVED, // Student submitted homework
        REMINDER,           // General reminder
        SYSTEM              // System notification
    }
    
    public enum NotificationPriority {
        LOW, NORMAL, HIGH, URGENT
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public void markAsRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }
}
