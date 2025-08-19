package com.homework.repository;

import com.homework.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    
    // Find events for a specific user
    List<CalendarEvent> findByUserIdOrderByStartTimeAsc(Long userId);
    
    // Find events for a user within a date range
    List<CalendarEvent> findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(
        Long userId, LocalDateTime start, LocalDateTime end);
    
    // Find events for a specific date range (for all users)
    List<CalendarEvent> findByStartTimeBetweenOrderByStartTimeAsc(
        LocalDateTime start, LocalDateTime end);
    
    // Find events by type for a user
    List<CalendarEvent> findByUserIdAndEventTypeOrderByStartTimeAsc(Long userId, CalendarEvent.EventType eventType);
    
    // Find events for a specific homework
    List<CalendarEvent> findByHomeworkId(Long homeworkId);
    
    // Find events for a specific class
    List<CalendarEvent> findByClassId(Long classId);
    
    // Find recurring events for a user
    List<CalendarEvent> findByUserIdAndRecurringTrueOrderByStartTimeAsc(Long userId);
    
    // Find events for multiple users (for class-wide events)
    List<CalendarEvent> findByUserIdInOrderByStartTimeAsc(List<Long> userIds);
    
    // Find upcoming events for a user
    @Query("SELECT ce FROM CalendarEvent ce WHERE ce.userId = :userId AND ce.startTime >= :now ORDER BY ce.startTime ASC")
    List<CalendarEvent> findUpcomingEventsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    // Find events for today
    @Query("SELECT ce FROM CalendarEvent ce WHERE ce.userId = :userId AND DATE(ce.startTime) = DATE(:today) ORDER BY ce.startTime ASC")
    List<CalendarEvent> findTodayEventsForUser(@Param("userId") Long userId, @Param("today") LocalDateTime today);
    
    // Find events for this week
    @Query("SELECT ce FROM CalendarEvent ce WHERE ce.userId = :userId AND ce.startTime BETWEEN :weekStart AND :weekEnd ORDER BY ce.startTime ASC")
    List<CalendarEvent> findWeekEventsForUser(
        @Param("userId") Long userId, 
        @Param("weekStart") LocalDateTime weekStart, 
        @Param("weekEnd") LocalDateTime weekEnd);
    
    // Find events for this month
    @Query("SELECT ce FROM CalendarEvent ce WHERE ce.userId = :userId AND ce.startTime BETWEEN :monthStart AND :monthEnd ORDER BY ce.startTime ASC")
    List<CalendarEvent> findMonthEventsForUser(
        @Param("userId") Long userId, 
        @Param("monthStart") LocalDateTime monthStart, 
        @Param("monthEnd") LocalDateTime monthEnd);
    
    // Delete events for a specific homework (when homework is deleted)
    void deleteByHomeworkId(Long homeworkId);
    
    // Delete events for a specific class (when class is deleted)
    void deleteByClassId(Long classId);
}
