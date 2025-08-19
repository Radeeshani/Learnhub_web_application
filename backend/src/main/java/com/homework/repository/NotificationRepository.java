package com.homework.repository;

import com.homework.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications for a specific user
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find unread notifications for a user
    List<Notification> findByUserIdAndReadOrderByCreatedAtDesc(Long userId, boolean read);
    
    // Find notifications by type for a user
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, Notification.NotificationType type);
    
    // Find notifications by priority for a user
    List<Notification> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, Notification.NotificationPriority priority);
    
    // Find notifications created after a specific time
    List<Notification> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(Long userId, LocalDateTime after);
    
    // Count unread notifications for a user
    long countByUserIdAndRead(Long userId, boolean read);
    
    // Find notifications for homework
    List<Notification> findByHomeworkIdOrderByCreatedAtDesc(Long homeworkId);
    
    // Find notifications for multiple users (for bulk operations)
    List<Notification> findByUserIdInOrderByCreatedAtDesc(List<Long> userIds);
    
    // Find overdue homework notifications
    @Query("SELECT n FROM Notification n WHERE n.type = 'OVERDUE' AND n.createdAt > :since")
    List<Notification> findOverdueNotificationsSince(@Param("since") LocalDateTime since);
    
    // Find due soon homework notifications
    @Query("SELECT n FROM Notification n WHERE n.type = 'DUE_SOON' AND n.createdAt > :since")
    List<Notification> findDueSoonNotificationsSince(@Param("since") LocalDateTime since);
    
    // Delete old notifications (cleanup)
    void deleteByCreatedAtBefore(LocalDateTime before);
}
