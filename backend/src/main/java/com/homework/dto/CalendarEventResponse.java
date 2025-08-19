package com.homework.dto;

import com.homework.entity.CalendarEvent;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CalendarEventResponse {
    
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean allDay;
    private String eventType;
    private Long userId;
    private Long homeworkId;
    private Long classId;
    private String color;
    private String location;
    private boolean recurring;
    private String recurrencePattern;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for frontend display
    private String homeworkTitle;
    private String className;
    private String userName;
    
    public static CalendarEventResponse fromEntity(CalendarEvent event) {
        CalendarEventResponse response = new CalendarEventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setStartTime(event.getStartTime());
        response.setEndTime(event.getEndTime());
        response.setAllDay(event.isAllDay());
        response.setEventType(event.getEventType().name());
        response.setUserId(event.getUserId());
        response.setHomeworkId(event.getHomeworkId());
        response.setClassId(event.getClassId());
        response.setColor(event.getColor());
        response.setLocation(event.getLocation());
        response.setRecurring(event.isRecurring());
        response.setRecurrencePattern(event.getRecurrencePattern());
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());
        
        return response;
    }
}
