package com.homework.dto;

import com.homework.entity.CalendarEvent;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CalendarEventRequest {
    
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean allDay;
    private String eventType;
    private Long homeworkId;
    private Long classId;
    private String color;
    private String location;
    private boolean recurring;
    private String recurrencePattern;
    
    public CalendarEvent.EventType getEventTypeEnum() {
        try {
            return CalendarEvent.EventType.valueOf(eventType);
        } catch (Exception e) {
            return CalendarEvent.EventType.CUSTOM;
        }
    }
}
