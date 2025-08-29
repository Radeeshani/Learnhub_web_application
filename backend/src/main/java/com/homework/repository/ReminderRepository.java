package com.homework.repository;

import com.homework.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    
    // Find all pending reminders that should be sent now
    @Query("SELECT r FROM Reminder r WHERE r.status = 'PENDING' AND r.reminderTime <= :now")
    List<Reminder> findPendingRemindersToSend(@Param("now") LocalDateTime now);
    
    // Find reminders for a specific user
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId ORDER BY r.reminderTime DESC")
    List<Reminder> findByUserId(@Param("userId") Long userId);
    
    // Find unread reminders for a specific user
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.isRead = false ORDER BY r.reminderTime DESC")
    List<Reminder> findUnreadByUserId(@Param("userId") Long userId);
    
    // Find reminders for a specific homework
    @Query("SELECT r FROM Reminder r WHERE r.homework.id = :homeworkId")
    List<Reminder> findByHomeworkId(@Param("homeworkId") Long homeworkId);
    
    // Find reminders for a specific user and homework
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.homework.id = :homeworkId")
    List<Reminder> findByUserIdAndHomeworkId(@Param("userId") Long userId, @Param("homeworkId") Long homeworkId);
    
    // Find overdue reminders for a user
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.reminderType = 'OVERDUE' AND r.status = 'PENDING'")
    List<Reminder> findOverdueRemindersByUserId(@Param("userId") Long userId);
    
    // Find due soon reminders for a user
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.reminderType IN ('DUE_SOON_24H', 'DUE_SOON_12H', 'DUE_SOON_6H', 'DUE_SOON_1H') AND r.status = 'PENDING'")
    List<Reminder> findDueSoonRemindersByUserId(@Param("userId") Long userId);
    
    // Count unread reminders for a user
    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.user.id = :userId AND r.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);
    
    // Delete old sent reminders (cleanup)
    @Query("DELETE FROM Reminder r WHERE r.status = 'SENT' AND r.reminderTime < :cutoffDate")
    void deleteOldSentReminders(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find reminders by status and created before date (for cleanup)
    @Query("SELECT r FROM Reminder r WHERE r.status = :status AND r.createdAt < :cutoffDate")
    List<Reminder> findByStatusAndCreatedAtBefore(@Param("status") Reminder.ReminderStatus status, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Count reminders by status
    long countByStatus(Reminder.ReminderStatus status);
    
    // Find reminders by priority for a user
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.priority = :priority ORDER BY r.reminderTime DESC")
    List<Reminder> findByUserIdAndPriority(@Param("userId") Long userId, @Param("priority") com.homework.entity.Notification.NotificationPriority priority);
    
    // Find urgent reminders for a user
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.priority = 'URGENT' AND r.isRead = false ORDER BY r.reminderTime DESC")
    List<Reminder> findUrgentRemindersByUserId(@Param("userId") Long userId);
}
