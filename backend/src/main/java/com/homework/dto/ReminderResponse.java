package com.homework.dto;

import com.homework.entity.Reminder;
import com.homework.entity.Notification.NotificationPriority;
import java.time.LocalDateTime;

public class ReminderResponse {
    private Long id;
    private Long homeworkId;
    private String homeworkTitle;
    private String title;
    private String message;
    private NotificationPriority priority;
    private String type;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private boolean isRead;
    
    public ReminderResponse() {}
    
    public ReminderResponse(Reminder reminder) {
        this.id = reminder.getId();
        this.homeworkId = reminder.getHomework().getId();
        this.homeworkTitle = reminder.getHomework().getTitle();
        this.title = reminder.getTitle();
        this.message = reminder.getMessage();
        this.priority = reminder.getPriority();
        this.type = reminder.getReminderType().toString();
        this.dueDate = reminder.getDueDate();
        this.createdAt = reminder.getCreatedAt();
        this.isRead = reminder.isRead();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getHomeworkId() { return homeworkId; }
    public void setHomeworkId(Long homeworkId) { this.homeworkId = homeworkId; }
    
    public String getHomeworkTitle() { return homeworkTitle; }
    public void setHomeworkTitle(String homeworkTitle) { this.homeworkTitle = homeworkTitle; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public boolean isRead() { return isRead; }
    public void setIsRead(boolean isRead) { this.isRead = isRead; }
}
