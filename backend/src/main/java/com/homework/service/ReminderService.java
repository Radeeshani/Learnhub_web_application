package com.homework.service;

import com.homework.entity.Reminder;
import com.homework.entity.Homework;
import com.homework.entity.User;
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
import java.util.List;
import java.util.Optional;

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
     * Create reminders for a new homework assignment
     */
    @Transactional
    public void createHomeworkReminders(Homework homework) {
        try {
            // Get all students in the grade
            List<User> students = userRepository.findByClassGrade(homework.getClassGrade());
            
            for (User student : students) {
                if (student.getRole().toString().equals("STUDENT")) {
                    createRemindersForStudent(homework, student);
                }
            }
            
            logger.info("Created reminders for {} students for homework: {}", students.size(), homework.getTitle());
        } catch (Exception e) {
            logger.error("Error creating homework reminders", e);
        }
    }
    
    /**
     * Create all reminder types for a student
     */
    private void createRemindersForStudent(Homework homework, User student) {
        LocalDateTime dueDate = homework.getDueDate();
        
        // Create 24-hour reminder
        createReminder(homework, student, Reminder.ReminderType.DUE_SOON_24H, 
                      dueDate.minus(24, ChronoUnit.HOURS), dueDate);
        
        // Create 12-hour reminder
        createReminder(homework, student, Reminder.ReminderType.DUE_SOON_12H, 
                      dueDate.minus(12, ChronoUnit.HOURS), dueDate);
        
        // Create 6-hour reminder
        createReminder(homework, student, Reminder.ReminderType.DUE_SOON_6H, 
                      dueDate.minus(6, ChronoUnit.HOURS), dueDate);
        
        // Create 1-hour reminder
        createReminder(homework, student, Reminder.ReminderType.DUE_SOON_1H, 
                      dueDate.minus(1, ChronoUnit.HOURS), dueDate);
        
        // Create overdue reminder (1 hour after due date)
        createReminder(homework, student, Reminder.ReminderType.OVERDUE, 
                      dueDate.plus(1, ChronoUnit.HOURS), dueDate);
    }
    
    /**
     * Create a single reminder
     */
    private void createReminder(Homework homework, User student, Reminder.ReminderType type, 
                               LocalDateTime reminderTime, LocalDateTime dueDate) {
        Reminder reminder = new Reminder();
        reminder.setHomework(homework);
        reminder.setUser(student);
        reminder.setReminderType(type);
        reminder.setReminderTime(reminderTime);
        reminder.setDueDate(dueDate);
        reminder.setTitle(generateReminderTitle(type, homework));
        reminder.setMessage(generateReminderMessage(type, homework));
        reminder.setStatus(Reminder.ReminderStatus.PENDING);
        reminder.setRead(false);
        
        reminderRepository.save(reminder);
    }
    
    /**
     * Generate reminder title based on type
     */
    private String generateReminderTitle(Reminder.ReminderType type, Homework homework) {
        switch (type) {
            case DUE_SOON_24H:
                return "Homework Due Tomorrow: " + homework.getTitle();
            case DUE_SOON_12H:
                return "Homework Due in 12 Hours: " + homework.getTitle();
            case DUE_SOON_6H:
                return "Homework Due in 6 Hours: " + homework.getTitle();
            case DUE_SOON_1H:
                return "Homework Due in 1 Hour: " + homework.getTitle();
            case OVERDUE:
                return "Homework Overdue: " + homework.getTitle();
            default:
                return "Homework Reminder: " + homework.getTitle();
        }
    }
    
    /**
     * Generate reminder message based on type
     */
    private String generateReminderMessage(Reminder.ReminderType type, Homework homework) {
        String subject = homework.getSubject();
        String grade = homework.getClassGrade();
        String dueDateStr = homework.getDueDate().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm"));
        
        switch (type) {
            case DUE_SOON_24H:
                return String.format("Your %s homework for %s is due tomorrow at %s. Please complete it soon!", 
                                   subject, grade, dueDateStr);
            case DUE_SOON_12H:
                return String.format("Your %s homework for %s is due in 12 hours at %s. Time to finish up!", 
                                   subject, grade, dueDateStr);
            case DUE_SOON_6H:
                return String.format("Your %s homework for %s is due in 6 hours at %s. Don't wait too long!", 
                                   subject, grade, dueDateStr);
            case DUE_SOON_1H:
                return String.format("Your %s homework for %s is due in 1 hour at %s. Submit now!", 
                                   subject, grade, dueDateStr);
            case OVERDUE:
                return String.format("Your %s homework for %s was due at %s and is now overdue. Please submit as soon as possible!", 
                                   subject, grade, dueDateStr);
            default:
                return String.format("Reminder: Your %s homework for %s is due at %s.", 
                                   subject, grade, dueDateStr);
        }
    }
    
    /**
     * Scheduled task to process pending reminders every minute
     */
    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void processPendingReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Reminder> pendingReminders = reminderRepository.findPendingRemindersToSend(now);
            
            for (Reminder reminder : pendingReminders) {
                processReminder(reminder);
            }
            
            if (!pendingReminders.isEmpty()) {
                logger.info("Processed {} pending reminders", pendingReminders.size());
            }
        } catch (Exception e) {
            logger.error("Error processing pending reminders", e);
        }
    }
    
    /**
     * Process a single reminder
     */
    private void processReminder(Reminder reminder) {
        try {
            // Create notification
            notificationService.createNotification(
                reminder.getUser().getId(),
                com.homework.entity.Notification.NotificationType.REMINDER,
                reminder.getTitle(),
                reminder.getMessage(),
                reminder.getHomework().getId(),
                reminder.getHomework().getTitle(),
                com.homework.entity.Notification.NotificationPriority.HIGH
            );
            
            // Mark reminder as sent
            reminder.setStatus(Reminder.ReminderStatus.SENT);
            reminderRepository.save(reminder);
            
            logger.debug("Processed reminder {} for user {}", reminder.getId(), reminder.getUser().getEmail());
        } catch (Exception e) {
            logger.error("Error processing reminder {}", reminder.getId(), e);
            reminder.setStatus(Reminder.ReminderStatus.FAILED);
            reminderRepository.save(reminder);
        }
    }
    
    /**
     * Get all reminders for a user
     */
    public List<Reminder> getUserReminders(Long userId) {
        return reminderRepository.findByUserId(userId);
    }
    
    /**
     * Get unread reminders for a user
     */
    public List<Reminder> getUserUnreadReminders(Long userId) {
        return reminderRepository.findUnreadByUserId(userId);
    }
    
    /**
     * Mark reminder as read
     */
    @Transactional
    public Reminder markReminderAsRead(Long reminderId) {
        Optional<Reminder> reminderOpt = reminderRepository.findById(reminderId);
        if (reminderOpt.isPresent()) {
            Reminder reminder = reminderOpt.get();
            reminder.setRead(true);
            return reminderRepository.save(reminder);
        }
        return null;
    }
    
    /**
     * Mark all reminders as read for a user
     */
    @Transactional
    public void markAllRemindersAsRead(Long userId) {
        List<Reminder> unreadReminders = reminderRepository.findUnreadByUserId(userId);
        for (Reminder reminder : unreadReminders) {
            reminder.setRead(true);
        }
        reminderRepository.saveAll(unreadReminders);
    }
    
    /**
     * Delete old sent reminders (cleanup)
     */
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    @Transactional
    public void cleanupOldReminders() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30); // Keep reminders for 30 days
            reminderRepository.deleteOldSentReminders(cutoffDate);
            logger.info("Cleaned up old sent reminders");
        } catch (Exception e) {
            logger.error("Error cleaning up old reminders", e);
        }
    }
    
    /**
     * Cancel reminders for a homework (when homework is deleted or modified)
     */
    @Transactional
    public void cancelHomeworkReminders(Long homeworkId) {
        List<Reminder> reminders = reminderRepository.findByHomeworkId(homeworkId);
        for (Reminder reminder : reminders) {
            if (reminder.getStatus() == Reminder.ReminderStatus.PENDING) {
                reminder.setStatus(Reminder.ReminderStatus.CANCELLED);
            }
        }
        reminderRepository.saveAll(reminders);
        logger.info("Cancelled {} reminders for homework {}", reminders.size(), homeworkId);
    }
}
