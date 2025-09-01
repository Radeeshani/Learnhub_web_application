package com.homework.service;

import com.homework.entity.Notification;
import com.homework.entity.Homework;
import com.homework.entity.HomeworkSubmission;
import com.homework.entity.User;
import com.homework.enums.UserRole;
import com.homework.repository.NotificationRepository;
import com.homework.repository.UserRepository;
import com.homework.repository.HomeworkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HomeworkRepository homeworkRepository;
    
    // Create a notification for a single user
    public Notification createNotification(Long userId, Notification.NotificationType type, 
                                        String title, String message, Long homeworkId, 
                                        String homeworkTitle, Notification.NotificationPriority priority) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setHomeworkId(homeworkId);
        notification.setHomeworkTitle(homeworkTitle);
        notification.setPriority(priority);
        notification.setCreatedAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }
    
    // Create notifications for multiple users
    public List<Notification> createBulkNotifications(List<Long> userIds, Notification.NotificationType type,
                                                    String title, String message, Long homeworkId,
                                                    String homeworkTitle, Notification.NotificationPriority priority) {
        List<Notification> notifications = userIds.stream()
            .map(userId -> {
                Notification notification = new Notification();
                notification.setUserId(userId);
                notification.setType(type);
                notification.setTitle(title);
                notification.setMessage(message);
                notification.setHomeworkId(homeworkId);
                notification.setHomeworkTitle(homeworkTitle);
                notification.setPriority(priority);
                notification.setCreatedAt(LocalDateTime.now());
                return notification;
            })
            .collect(Collectors.toList());
        
        return notificationRepository.saveAll(notifications);
    }
    
    // Get notifications for a user
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    // Get unread notifications for a user
    public List<Notification> getUserUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false);
    }
    
    // Get reminder notifications for a user
    public List<Notification> getReminderNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, Notification.NotificationType.REMINDER);
    }
    
    // Mark notification as read
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.markAsRead();
        return notificationRepository.save(notification);
    }
    
    // Mark all notifications as read for a user
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUserUnreadNotifications(userId);
        unreadNotifications.forEach(Notification::markAsRead);
        notificationRepository.saveAll(unreadNotifications);
    }
    
    // Delete notification
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    // Clear all notifications for a user
    public void clearAllNotifications(Long userId) {
        List<Notification> userNotifications = getUserNotifications(userId);
        notificationRepository.deleteAll(userNotifications);
    }
    
    // Create homework due soon notification
    public void createDueSoonNotification(Homework homework) {
        // Get all students who haven't submitted this homework
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueDate = homework.getDueDate();
        long daysUntilDue = ChronoUnit.DAYS.between(now, dueDate);
        
        if (daysUntilDue <= 3 && daysUntilDue > 0) {
            String title = "Homework Due Soon";
            String message = String.format("Your homework '%s' is due in %d day(s)", 
                                        homework.getTitle(), daysUntilDue);
            
            List<Long> studentIds = students.stream()
                .map(User::getId)
                .collect(Collectors.toList());
            
            createBulkNotifications(studentIds, Notification.NotificationType.DUE_SOON,
                                 title, message, homework.getId(), homework.getTitle(),
                                 daysUntilDue == 1 ? Notification.NotificationPriority.HIGH : 
                                 Notification.NotificationPriority.NORMAL);
        }
    }
    
    // Create overdue homework notification
    public void createOverdueNotification(Homework homework) {
        // Get all students who haven't submitted this homework
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        
        String title = "Homework Overdue";
        String message = String.format("Your homework '%s' is overdue. Please submit as soon as possible.", 
                                    homework.getTitle());
        
        List<Long> studentIds = students.stream()
            .map(User::getId)
            .collect(Collectors.toList());
        
        createBulkNotifications(studentIds, Notification.NotificationType.OVERDUE,
                             title, message, homework.getId(), homework.getTitle(),
                             Notification.NotificationPriority.URGENT);
    }
    
    // Create new homework notification
    public void createNewHomeworkNotification(Homework homework) {
        logger.info("🔄 Starting new homework notification process for homework: '{}' (ID: {})", homework.getTitle(), homework.getId());
        
        try {
            // Get all students
            List<User> students = userRepository.findByRole(UserRole.STUDENT);
            logger.info("👥 Found {} students to notify", students.size());
            
            String title = "New Homework Assigned";
            String message = String.format("New homework '%s' has been assigned. Due date: %s", 
                                        homework.getTitle(), homework.getDueDate().toString());
            
            List<Long> studentIds = students.stream()
                .map(User::getId)
                .collect(Collectors.toList());
            
            logger.info("📝 Creating database notifications for {} students", studentIds.size());
            List<Notification> notifications = createBulkNotifications(studentIds, Notification.NotificationType.NEW_HOMEWORK,
                             title, message, homework.getId(), homework.getTitle(),
                             Notification.NotificationPriority.NORMAL);
            
            logger.info("✅ Database notifications created successfully: {} notifications", notifications.size());
            logger.info("🎉 New homework notification process completed for homework: '{}'", homework.getTitle());
            
        } catch (Exception e) {
            logger.error("❌ Error in createNewHomeworkNotification for homework '{}': {}", homework.getTitle(), e.getMessage(), e);
            throw e;
        }
    }
    
    // Create submission received notification for teacher
    public void createSubmissionNotification(HomeworkSubmission submission, String homeworkTitle) {
        // Get the teacher who assigned this homework
        Homework homework = homeworkRepository.findById(submission.getHomeworkId())
            .orElseThrow(() -> new RuntimeException("Homework not found"));
        
        // For now, we'll notify all teachers (in a real system, you'd track which teacher assigned which homework)
        List<User> teachers = userRepository.findByRole(UserRole.TEACHER);
        
        String title = "Homework Submission Received";
        String message = String.format("Student has submitted homework '%s'", homeworkTitle);
        
        List<Long> teacherIds = teachers.stream()
            .map(User::getId)
            .collect(Collectors.toList());
        
        createBulkNotifications(teacherIds, Notification.NotificationType.SUBMISSION_RECEIVED,
                             title, message, homework.getId(), homeworkTitle,
                             Notification.NotificationPriority.NORMAL);
    }
    
    // Create graded notification for student
    public void createGradedNotification(HomeworkSubmission submission, String homeworkTitle) {
        String title = "Homework Graded";
        String message = String.format("Your homework '%s' has been graded. Check your dashboard for details.", 
                                    homeworkTitle);
        
        Notification notification = createNotification(submission.getStudentId(), Notification.NotificationType.GRADED,
                         title, message, submission.getHomeworkId(), homeworkTitle,
                         Notification.NotificationPriority.NORMAL);
    }
    
    // Scheduled task to check for due soon and overdue homework
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void checkHomeworkDeadlines() {
        LocalDateTime now = LocalDateTime.now();
        List<Homework> activeHomeworks = homeworkRepository.findByDueDateAfter(now.minusDays(1));
        
        for (Homework homework : activeHomeworks) {
            long daysUntilDue = ChronoUnit.DAYS.between(now, homework.getDueDate());
            
            if (daysUntilDue <= 3 && daysUntilDue > 0) {
                // Due soon
                createDueSoonNotification(homework);
            } else if (daysUntilDue < 0) {
                // Overdue
                createOverdueNotification(homework);
            }
        }
    }
    
    // Clean up old notifications (run daily)
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    public void cleanupOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteByCreatedAtBefore(thirtyDaysAgo);
    }
}
