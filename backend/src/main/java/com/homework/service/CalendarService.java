package com.homework.service;

import com.homework.entity.CalendarEvent;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.repository.CalendarEventRepository;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.UserRepository;
import com.homework.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarService {
    
    @Autowired
    private CalendarEventRepository calendarEventRepository;
    
    @Autowired
    private HomeworkRepository homeworkRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    // Get a calendar event by ID
    public CalendarEvent getEventById(Long eventId) {
        return calendarEventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Calendar event not found"));
    }
    
    // Create a calendar event
    public CalendarEvent createEvent(CalendarEvent event) {
        return calendarEventRepository.save(event);
    }
    
    // Update a calendar event
    public CalendarEvent updateEvent(Long eventId, CalendarEvent eventDetails) {
        CalendarEvent existingEvent = calendarEventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Calendar event not found"));
        
        existingEvent.setTitle(eventDetails.getTitle());
        existingEvent.setDescription(eventDetails.getDescription());
        existingEvent.setStartTime(eventDetails.getStartTime());
        existingEvent.setEndTime(eventDetails.getEndTime());
        existingEvent.setAllDay(eventDetails.isAllDay());
        existingEvent.setEventType(eventDetails.getEventType());
        existingEvent.setColor(eventDetails.getColor());
        existingEvent.setLocation(eventDetails.getLocation());
        existingEvent.setRecurring(eventDetails.isRecurring());
        existingEvent.setRecurrencePattern(eventDetails.getRecurrencePattern());
        
        return calendarEventRepository.save(existingEvent);
    }
    
    // Delete a calendar event
    public void deleteEvent(Long eventId) {
        calendarEventRepository.deleteById(eventId);
    }
    
    // Get events for a user within a date range (now shows all events in range)
    public List<CalendarEvent> getUserEventsInRange(Long userId, LocalDateTime start, LocalDateTime end) {
        // Return ALL events in the date range, not just user-specific ones
        return calendarEventRepository.findByStartTimeBetweenOrderByStartTimeAsc(start, end);
    }
    
    // Get today's events for a user (now shows all events for today)
    public List<CalendarEvent> getTodayEvents(Long userId) {
        LocalDateTime today = LocalDateTime.now();
        // Return ALL events for today, not just user-specific ones
        return calendarEventRepository.findByStartTimeBetweenOrderByStartTimeAsc(
            today.withHour(0).withMinute(0).withSecond(0),
            today.withHour(23).withMinute(59).withSecond(59)
        );
    }
    
    // Get this week's events for a user (now shows all events for the week)
    public List<CalendarEvent> getWeekEvents(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekEnd = weekStart.plusDays(7).minusSeconds(1);
        
        // Return ALL events for the week, not just user-specific ones
        return calendarEventRepository.findByStartTimeBetweenOrderByStartTimeAsc(weekStart, weekEnd);
    }
    
    // Get this month's events for a user (now shows all events for all users)
    public List<CalendarEvent> getMonthEvents(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
        
        // Debug logging
        System.out.println("=== CalendarService.getMonthEvents Debug ===");
        System.out.println("User ID: " + userId);
        System.out.println("Current time: " + now);
        System.out.println("Month start: " + monthStart);
        System.out.println("Month end: " + monthEnd);
        
        // Return ALL events for the month, not just user-specific ones
        List<CalendarEvent> events = calendarEventRepository.findByStartTimeBetweenOrderByStartTimeAsc(monthStart, monthEnd);
        System.out.println("Found events: " + events.size());
        events.forEach(event -> System.out.println("Event: " + event.getTitle() + " at " + event.getStartTime() + " for user: " + event.getUserId()));
        System.out.println("=== End Debug ===");
        
        return events;
    }
    
    // Get upcoming events for a user (now shows all upcoming events)
    public List<CalendarEvent> getUpcomingEvents(Long userId, int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusDays(days);
        
        // Return ALL upcoming events, not just user-specific ones
        return calendarEventRepository.findByStartTimeBetweenOrderByStartTimeAsc(now, endDate);
    }
    
    // Create calendar event from homework assignment
    public CalendarEvent createHomeworkEvent(Homework homework, Long userId) {
        CalendarEvent event = new CalendarEvent();
        event.setTitle("📚 " + homework.getTitle());
        event.setDescription(homework.getDescription());
        event.setStartTime(homework.getDueDate());
        event.setEndTime(homework.getDueDate().plusHours(1)); // 1 hour duration
        event.setAllDay(false);
        event.setEventType(CalendarEvent.EventType.HOMEWORK_DUE);
        event.setUserId(userId);
        event.setHomeworkId(homework.getId());
        event.setColor("#EF4444"); // Red color for due dates
        
        return calendarEventRepository.save(event);
    }
    
    // Create calendar event for homework assignment (when teacher assigns)
    public CalendarEvent createHomeworkAssignedEvent(Homework homework, Long studentId) {
        CalendarEvent event = new CalendarEvent();
        event.setTitle("📝 " + homework.getTitle() + " - Assigned");
        event.setDescription("New homework assigned: " + homework.getDescription());
        event.setStartTime(homework.getCreatedAt());
        event.setEndTime(homework.getCreatedAt().plusMinutes(30)); // 30 minutes duration
        event.setAllDay(false);
        event.setEventType(CalendarEvent.EventType.HOMEWORK_ASSIGNED);
        event.setUserId(studentId);
        event.setHomeworkId(homework.getId());
        event.setColor("#10B981"); // Green color for assignments
        
        return calendarEventRepository.save(event);
    }
    
    // Create recurring class session events
    public List<CalendarEvent> createRecurringClassEvents(Long classId, String className, 
                                                        Long teacherId, List<Long> studentIds,
                                                        DayOfWeek dayOfWeek, LocalTime startTime, 
                                                        LocalTime endTime, LocalDate startDate, 
                                                        LocalDate endDate) {
        List<CalendarEvent> events = java.util.List.of();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            if (currentDate.getDayOfWeek() == dayOfWeek) {
                // Create event for teacher
                CalendarEvent teacherEvent = new CalendarEvent();
                teacherEvent.setTitle("👨‍🏫 " + className);
                teacherEvent.setDescription("Class session");
                teacherEvent.setStartTime(LocalDateTime.of(currentDate, startTime));
                teacherEvent.setEndTime(LocalDateTime.of(currentDate, endTime));
                teacherEvent.setAllDay(false);
                teacherEvent.setEventType(CalendarEvent.EventType.CLASS_SESSION);
                teacherEvent.setUserId(teacherId);
                teacherEvent.setClassId(classId);
                teacherEvent.setColor("#8B5CF6"); // Purple color for classes
                teacherEvent.setRecurring(true);
                teacherEvent.setRecurrencePattern("WEEKLY");
                
                events.add(calendarEventRepository.save(teacherEvent));
                
                // Create events for students
                for (Long studentId : studentIds) {
                    CalendarEvent studentEvent = new CalendarEvent();
                    studentEvent.setTitle("📚 " + className);
                    studentEvent.setDescription("Class session");
                    studentEvent.setStartTime(LocalDateTime.of(currentDate, startTime));
                    studentEvent.setEndTime(LocalDateTime.of(currentDate, endTime));
                    studentEvent.setAllDay(false);
                    studentEvent.setEventType(CalendarEvent.EventType.CLASS_SESSION);
                    studentEvent.setUserId(studentId);
                    studentEvent.setClassId(classId);
                    studentEvent.setColor("#8B5CF6"); // Purple color for classes
                    studentEvent.setRecurring(true);
                    studentEvent.setRecurrencePattern("WEEKLY");
                    
                    events.add(calendarEventRepository.save(studentEvent));
                }
            }
            currentDate = currentDate.plusDays(1);
        }
        
        return events;
    }
    
    // Get events by type for a user
    public List<CalendarEvent> getEventsByType(Long userId, CalendarEvent.EventType eventType) {
        return calendarEventRepository.findByUserIdAndEventTypeOrderByStartTimeAsc(userId, eventType);
    }
    
    // Search events by title or description (now searches all events)
    public List<CalendarEvent> searchEvents(Long userId, String searchTerm) {
        // Search ALL events, not just user-specific ones
        List<CalendarEvent> allEvents = calendarEventRepository.findAll();
        
        return allEvents.stream()
            .filter(event -> 
                event.getTitle().toLowerCase().contains(searchTerm.toLowerCase()) ||
                (event.getDescription() != null && 
                 event.getDescription().toLowerCase().contains(searchTerm.toLowerCase())))
            .collect(Collectors.toList());
    }
    
    // Get calendar summary for a user (counts by type)
    public java.util.Map<CalendarEvent.EventType, Long> getCalendarSummary(Long userId) {
        List<CalendarEvent> allEvents = calendarEventRepository.findByUserIdOrderByStartTimeAsc(userId);
        
        return allEvents.stream()
            .collect(Collectors.groupingBy(
                CalendarEvent::getEventType,
                Collectors.counting()
            ));
    }
    
    // Clean up old events (older than 1 year)
    public void cleanupOldEvents() {
        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
        List<CalendarEvent> oldEvents = calendarEventRepository.findByStartTimeBetweenOrderByStartTimeAsc(
            LocalDateTime.MIN, oneYearAgo);
        
        calendarEventRepository.deleteAll(oldEvents);
    }
}
