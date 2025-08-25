package com.homework.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
@Data
@NoArgsConstructor
public class Reminder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "homework_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Homework homework;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReminderType reminderType;
    
    @Column(nullable = false)
    private LocalDateTime reminderTime;
    
    @Column(nullable = false)
    private LocalDateTime dueDate;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReminderStatus status;
    
    @Column(name = "is_read", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean isRead;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    public enum ReminderType {
        DUE_SOON_24H,      // 24 hours before due date
        DUE_SOON_12H,      // 12 hours before due date
        DUE_SOON_6H,       // 6 hours before due date
        DUE_SOON_1H,       // 1 hour before due date
        OVERDUE,           // After due date
        CUSTOM             // Custom reminder time
    }
    
    public enum ReminderStatus {
        PENDING,           // Reminder not yet sent
        SENT,              // Reminder sent successfully
        FAILED,            // Failed to send reminder
        CANCELLED          // Reminder cancelled
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ReminderStatus.PENDING;
        }
        // isRead defaults to false, no need to set it again
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
