package com.homework.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "calendar_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column(name = "all_day", nullable = false)
    private boolean allDay = false;
    
    @Column(name = "event_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EventType eventType;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "homework_id")
    private Long homeworkId;
    
    @Column(name = "class_id")
    private Long classId;
    
    @Column(name = "color", length = 7)
    private String color = "#3B82F6"; // Default blue color
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "recurring", nullable = false)
    private boolean recurring = false;
    
    @Column(name = "recurrence_pattern")
    private String recurrencePattern; // e.g., "WEEKLY", "MONTHLY"
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum EventType {
        HOMEWORK_DUE,      // Homework due date
        HOMEWORK_ASSIGNED, // Homework assigned
        CLASS_SESSION,     // Regular class session
        EXAM,              // Exam or test
        HOLIDAY,           // School holiday
        MEETING,           // Parent-teacher meeting
        REMINDER,          // General reminder
        CUSTOM            // Custom event
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
