package com.homework.service;

import com.homework.entity.Reminder;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.dto.ReminderResponse;
import com.homework.repository.ReminderRepository;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.UserRepository;
import com.homework.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class ReminderService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReminderService.class);
    
    @Autowired
    private ReminderRepository reminderRepository;
    
    @Autowired
    private HomeworkRepository homeworkRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Create a single, smart reminder for a homework assignment
     * This prevents duplicate notifications and provides better UX
     */
    @Transactional
    public void createSmartHomeworkReminder(Homework homework) {
        try {
            // Get all students in the grade
            List<User> students = userRepository.findByClassGrade(homework.getClassGrade());
            
            for (User student : students) {
                if (student.getRole().toString().equals("STUDENT")) {
                    createSmartReminderForStudent(homework, student);
                }
            }
            
            logger.info("Created smart reminders for {} students for homework: {}", students.size(), homework.getTitle());
        } catch (Exception e) {
            logger.error("Error creating smart homework reminders", e);
        }
    }
    
    /**
     * Create a single, intelligent reminder for a student
     * This consolidates multiple reminder types into one smart notification
     */
    private void createSmartReminderForStudent(Homework homework, User student) {
        LocalDateTime dueDate = homework.getDueDate();
        LocalDateTime now = LocalDateTime.now();
        
        // Calculate time until due
        long hoursUntilDue = ChronoUnit.HOURS.between(now, dueDate);
        long minutesUntilDue = ChronoUnit.MINUTES.between(now, dueDate);
        
        // Debug logging to see what's happening
        logger.debug("Homework '{}' - Now: {}, Due: {}, Minutes until due: {}", 
                   homework.getTitle(), now, dueDate, minutesUntilDue);
        
        // Create reminders for ALL homework assignments, not just those due soon
        // This ensures students can see all their homework and plan accordingly
        Reminder reminder = new Reminder();
        reminder.setHomework(homework);
        reminder.setUser(student);
        reminder.setReminderType(Reminder.ReminderType.SMART);
        reminder.setReminderTime(now);
        reminder.setDueDate(dueDate);
        
        // Generate smart title and message based on time
        Map<String, String> smartContent = generateSmartReminderContent(homework, hoursUntilDue, minutesUntilDue);
        reminder.setTitle(smartContent.get("title"));
        reminder.setMessage(smartContent.get("message"));
        reminder.setStatus(Reminder.ReminderStatus.PENDING);
        reminder.setRead(false);
        
        // Set priority based on urgency
        if (minutesUntilDue < 0) {
            // Overdue
            reminder.setPriority(com.homework.entity.Notification.NotificationPriority.URGENT);
        } else if (minutesUntilDue < 60) {
            // Due within 1 hour
            reminder.setPriority(com.homework.entity.Notification.NotificationPriority.HIGH);
        } else if (minutesUntilDue < 360) {
            // Due within 6 hours
            reminder.setPriority(com.homework.entity.Notification.NotificationPriority.HIGH);
        } else if (minutesUntilDue < 1440) {
            // Due within 24 hours
            reminder.setPriority(com.homework.entity.Notification.NotificationPriority.NORMAL);
        } else {
            // Due in more than 24 hours - still important for planning
            reminder.setPriority(com.homework.entity.Notification.NotificationPriority.LOW);
        }
        
        reminderRepository.save(reminder);
        logger.debug("Created reminder for student {} for homework '{}'", student.getEmail(), homework.getTitle());
    }
    
    /**
     * Generate intelligent reminder content based on time until due
     */
    private Map<String, String> generateSmartReminderContent(Homework homework, long hoursUntilDue, long minutesUntilDue) {
        Map<String, String> content = new HashMap<>();
        String subject = homework.getSubject();
        String grade = homework.getClassGrade();
        String title = homework.getTitle();
        
        // Format due date for better readability
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm");
        String formattedDueDate = homework.getDueDate().format(formatter);
        
        if (minutesUntilDue < 0) {
            // Overdue - only if it's actually past the due date
            long hoursOverdue = Math.abs(hoursUntilDue);
            content.put("title", "Homework Overdue: " + title);
            
            if (hoursOverdue < 1) {
                content.put("message", String.format(
                    "Your %s homework for %s Grade was due at %s and is now overdue. Please submit as soon as possible!",
                    subject, grade, formattedDueDate
                ));
            } else if (hoursOverdue < 24) {
                content.put("message", String.format(
                    "Your %s homework for %s Grade was due at %s and is now %d hour(s) overdue. Please submit immediately!",
                    subject, grade, formattedDueDate, hoursOverdue
                ));
            } else {
                long daysOverdue = hoursOverdue / 24;
                content.put("message", String.format(
                    "Your %s homework for %s Grade was due at %s and is now %d day(s) overdue. This needs immediate attention!",
                    subject, grade, formattedDueDate, daysOverdue
                ));
            }
        } else if (minutesUntilDue < 60) {
            // Due within 1 hour
            content.put("title", "Homework Due in Less Than 1 Hour: " + title);
            content.put("message", String.format(
                "Your %s homework for %s Grade is due in less than 1 hour at %s. Submit now to avoid being late!",
                subject, grade, formattedDueDate
            ));
        } else if (hoursUntilDue < 6) {
            // Due within 6 hours
            content.put("title", "Homework Due in " + hoursUntilDue + " Hours: " + title);
            content.put("message", String.format(
                "Your %s homework for %s Grade is due in %d hour(s) at %s. Time to finish up!",
                subject, grade, hoursUntilDue, formattedDueDate
            ));
        } else if (hoursUntilDue < 24) {
            // Due within 24 hours
            content.put("title", "Homework Due Tomorrow: " + title);
            content.put("message", String.format(
                "Your %s homework for %s Grade is due tomorrow at %s. Don't forget to complete it!",
                subject, grade, formattedDueDate
            ));
        } else {
            // Due in more than 24 hours
            long daysUntilDue = hoursUntilDue / 24;
            content.put("title", "Homework Due in " + daysUntilDue + " Days: " + title);
            content.put("message", String.format(
                "Your %s homework for %s Grade is due in %d day(s) at %s. Plan your time wisely!",
                subject, grade, daysUntilDue, formattedDueDate
            ));
        }
        
        return content;
    }
    
    /**
     * Scheduled task to process pending reminders every 5 minutes
     * This reduces system load while still being responsive
     */
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    @Transactional
    public void processPendingReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Reminder> pendingReminders = reminderRepository.findPendingRemindersToSend(now);
            
            // Group reminders by user and homework to prevent duplicates
            Map<String, List<Reminder>> groupedReminders = pendingReminders.stream()
                .collect(Collectors.groupingBy(r -> r.getUser().getId() + "-" + r.getHomework().getId()));
            
            for (List<Reminder> userHomeworkReminders : groupedReminders.values()) {
                // Only process the most recent reminder for each user-homework combination
                Reminder mostRecentReminder = userHomeworkReminders.stream()
                    .max((r1, r2) -> r1.getCreatedAt().compareTo(r2.getCreatedAt()))
                    .orElse(null);
                
                if (mostRecentReminder != null) {
                    processSmartReminder(mostRecentReminder);
                    
                    // Mark all reminders for this user-homework as sent to prevent duplicates
                    userHomeworkReminders.forEach(r -> {
                        r.setStatus(Reminder.ReminderStatus.SENT);
                        reminderRepository.save(r);
                    });
                }
            }
            
            if (!pendingReminders.isEmpty()) {
                logger.info("Processed {} pending reminders, sent {} unique notifications", 
                           pendingReminders.size(), groupedReminders.size());
            }
        } catch (Exception e) {
            logger.error("Error processing pending reminders", e);
        }
    }
    
    /**
     * Process a single smart reminder
     */
    private void processSmartReminder(Reminder reminder) {
        try {
            // Determine notification priority based on urgency
            com.homework.entity.Notification.NotificationPriority priority = determinePriority(reminder);
            
            // Create notification
            notificationService.createNotification(
                reminder.getUser().getId(),
                com.homework.entity.Notification.NotificationType.REMINDER,
                reminder.getTitle(),
                reminder.getMessage(),
                reminder.getHomework().getId(),
                reminder.getHomework().getTitle(),
                priority
            );
            
            logger.debug("Processed smart reminder {} for user {}", reminder.getId(), reminder.getUser().getEmail());
        } catch (Exception e) {
            logger.error("Error processing smart reminder {}", reminder.getId(), e);
            reminder.setStatus(Reminder.ReminderStatus.FAILED);
            reminderRepository.save(reminder);
        }
    }
    
    /**
     * Determine notification priority based on reminder urgency
     */
    private com.homework.entity.Notification.NotificationPriority determinePriority(Reminder reminder) {
        LocalDateTime now = LocalDateTime.now();
        long minutesUntilDue = ChronoUnit.MINUTES.between(now, reminder.getDueDate());
        
        if (minutesUntilDue < 0) {
            // Overdue
            return com.homework.entity.Notification.NotificationPriority.URGENT;
        } else if (minutesUntilDue < 60) {
            // Due within 1 hour
            return com.homework.entity.Notification.NotificationPriority.HIGH;
        } else if (minutesUntilDue < 360) {
            // Due within 6 hours
            return com.homework.entity.Notification.NotificationPriority.HIGH;
        } else if (minutesUntilDue < 1440) {
            // Due within 24 hours
            return com.homework.entity.Notification.NotificationPriority.NORMAL;
        } else {
            // Due in more than 24 hours - this shouldn't happen with our new logic
            return com.homework.entity.Notification.NotificationPriority.LOW;
        }
    }
    
    /**
     * Get all reminders for a user (for display purposes)
     */
    public List<ReminderResponse> getUserReminders(Long userId) {
        List<Reminder> reminders = reminderRepository.findByUserId(userId);
        return reminders.stream()
                .map(ReminderResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all reminders for a user including both pending reminders and processed reminder notifications
     * This provides a comprehensive view of all reminders regardless of processing status
     */
    public List<ReminderResponse> getUserRemindersWithNotifications(Long userId) {
        List<ReminderResponse> allReminders = new ArrayList<>();
        
        // Get pending reminders
        List<Reminder> pendingReminders = reminderRepository.findByUserId(userId);
        allReminders.addAll(pendingReminders.stream()
                .map(ReminderResponse::new)
                .collect(Collectors.toList()));
        
        // Get processed reminder notifications
        List<com.homework.entity.Notification> reminderNotifications = notificationService.getReminderNotificationsByUserId(userId);
        allReminders.addAll(reminderNotifications.stream()
                .map(this::convertNotificationToReminderResponse)
                .collect(Collectors.toList()));
        
        // Sort by creation date (most recent first)
        allReminders.sort((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()));
        
        return allReminders;
    }
    
    /**
     * Get unread reminders for a user
     */
    public List<ReminderResponse> getUserUnreadReminders(Long userId) {
        List<Reminder> reminders = reminderRepository.findUnreadByUserId(userId);
        return reminders.stream()
                .map(ReminderResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Mark a reminder as read
     */
    public Reminder markReminderAsRead(Long reminderId) {
        Reminder reminder = reminderRepository.findById(reminderId)
            .orElseThrow(() -> new RuntimeException("Reminder not found"));
        
        reminder.setRead(true);
        reminder.setUpdatedAt(LocalDateTime.now());
        return reminderRepository.save(reminder);
    }
    
    /**
     * Mark all reminders as read for a user
     */
    public void markAllRemindersAsRead(Long userId) {
        List<Reminder> unreadReminders = reminderRepository.findUnreadByUserId(userId);
        unreadReminders.forEach(r -> {
            r.setRead(true);
            r.setUpdatedAt(LocalDateTime.now());
        });
        reminderRepository.saveAll(unreadReminders);
    }
    
    /**
     * Clean up old sent reminders (run daily)
     */
    @Scheduled(cron = "0 0 3 * * ?") // Run at 3 AM daily
    public void cleanupOldReminders() {
        try {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            List<Reminder> oldReminders = reminderRepository.findByStatusAndCreatedAtBefore(
                Reminder.ReminderStatus.SENT, sevenDaysAgo);
            
            if (!oldReminders.isEmpty()) {
                reminderRepository.deleteAll(oldReminders);
                logger.info("Cleaned up {} old sent reminders", oldReminders.size());
            }
        } catch (Exception e) {
            logger.error("Error cleaning up old reminders", e);
        }
    }

    /**
     * Convert a notification to a reminder response for display purposes
     */
    private ReminderResponse convertNotificationToReminderResponse(com.homework.entity.Notification notification) {
        ReminderResponse response = new ReminderResponse();
        response.setId(notification.getId());
        response.setHomeworkId(notification.getHomeworkId());
        response.setHomeworkTitle(notification.getHomeworkTitle());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setPriority(notification.getPriority());
        response.setType("NOTIFICATION");
        response.setDueDate(notification.getCreatedAt()); // Use notification creation time as due date for display
        response.setCreatedAt(notification.getCreatedAt());
        response.setIsRead(notification.isRead()); // Use the correct boolean field
        
        return response;
    }
}
