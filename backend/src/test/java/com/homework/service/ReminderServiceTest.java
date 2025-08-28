package com.homework.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.entity.Reminder;
import com.homework.entity.Notification;
import com.homework.dto.ReminderResponse;
import com.homework.enums.UserRole;
import com.homework.repository.ReminderRepository;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.UserRepository;
import com.homework.service.NotificationService;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class ReminderServiceTest {

    @InjectMocks
    private ReminderService reminderService;

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private HomeworkRepository homeworkRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    private User testStudent;
    private Homework testHomework;
    private Reminder testReminder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Setup test data
        testStudent = new User();
        testStudent.setId(1L);
        testStudent.setEmail("test@example.com");
        testStudent.setRole(UserRole.STUDENT);
        testStudent.setClassGrade("4th Grade");
        
        testHomework = new Homework();
        testHomework.setId(1L);
        testHomework.setTitle("Test Homework");
        testHomework.setSubject("Math");
        testHomework.setClassGrade("4th Grade");
        testHomework.setDueDate(LocalDateTime.now().plusDays(2));
        
        testReminder = new Reminder();
        testReminder.setId(1L);
        testReminder.setHomework(testHomework);
        testReminder.setUser(testStudent);
        testReminder.setReminderType(Reminder.ReminderType.SMART);
        testReminder.setStatus(Reminder.ReminderStatus.PENDING);
        testReminder.setRead(false);
    }

    @Test
    @DisplayName("Should create smart homework reminders for all students in grade")
    void testCreateSmartHomeworkReminder() {
        // Arrange
        List<User> students = Arrays.asList(testStudent);
        when(userRepository.findByClassGrade("4th Grade")).thenReturn(students);
        when(reminderRepository.save(any(Reminder.class))).thenReturn(testReminder);
        
        // Act
        reminderService.createSmartHomeworkReminder(testHomework);
        
        // Assert
        verify(userRepository).findByClassGrade("4th Grade");
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    @DisplayName("Should create reminders for homework due in more than 24 hours")
    void testCreateReminderForFutureHomework() {
        // Arrange
        LocalDateTime futureDueDate = LocalDateTime.now().plusDays(7);
        testHomework.setDueDate(futureDueDate);
        
        when(userRepository.findByClassGrade("4th Grade")).thenReturn(Arrays.asList(testStudent));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(testReminder);
        
        // Act
        reminderService.createSmartHomeworkReminder(testHomework);
        
        // Assert
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    @DisplayName("Should create reminders for overdue homework")
    void testCreateReminderForOverdueHomework() {
        // Arrange
        LocalDateTime pastDueDate = LocalDateTime.now().minusDays(1);
        testHomework.setDueDate(pastDueDate);
        
        when(userRepository.findByClassGrade("4th Grade")).thenReturn(Arrays.asList(testStudent));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(testReminder);
        
        // Act
        reminderService.createSmartHomeworkReminder(testHomework);
        
        // Assert
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    @DisplayName("Should process pending reminders and convert to notifications")
    void testProcessPendingReminders() {
        // Arrange
        List<Reminder> pendingReminders = Arrays.asList(testReminder);
        when(reminderRepository.findPendingRemindersToSend(any(LocalDateTime.class)))
            .thenReturn(pendingReminders);
        when(reminderRepository.save(any(Reminder.class))).thenReturn(testReminder);
        
        // Act
        reminderService.processPendingReminders();
        
        // Assert
        verify(notificationService).createNotification(
            eq(testStudent.getId()),
            eq(com.homework.entity.Notification.NotificationType.REMINDER),
            any(String.class),
            any(String.class),
            eq(testHomework.getId()),
            eq(testHomework.getTitle()),
            any(com.homework.entity.Notification.NotificationPriority.class)
        );
        verify(reminderRepository, times(2)).save(any(Reminder.class));
    }

    @Test
    @DisplayName("Should get user reminders with notifications")
    void testGetUserRemindersWithNotifications() {
        // Arrange
        List<Reminder> reminders = Arrays.asList(testReminder);
        List<Notification> notifications = Arrays.asList(createTestNotification());
        
        when(reminderRepository.findByUserId(1L)).thenReturn(reminders);
        when(notificationService.getReminderNotificationsByUserId(1L)).thenReturn(notifications);
        
        // Act
        List<ReminderResponse> result = reminderService.getUserRemindersWithNotifications(1L);
        
        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(2, result.size()); // 1 reminder + 1 notification
        verify(reminderRepository).findByUserId(1L);
        verify(notificationService).getReminderNotificationsByUserId(1L);
    }

    @Test
    @DisplayName("Should get user reminders only")
    void testGetUserReminders() {
        // Arrange
        List<Reminder> reminders = Arrays.asList(testReminder);
        when(reminderRepository.findByUserId(1L)).thenReturn(reminders);
        
        // Act
        List<ReminderResponse> result = reminderService.getUserReminders(1L);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testHomework.getTitle(), result.get(0).getHomeworkTitle());
    }

    @Test
    @DisplayName("Should mark reminder as read")
    void testMarkReminderAsRead() {
        // Arrange
        when(reminderRepository.findById(1L)).thenReturn(Optional.of(testReminder));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(testReminder);
        
        // Act
        Reminder result = reminderService.markReminderAsRead(1L);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.isRead());
        verify(reminderRepository).findById(1L);
        verify(reminderRepository).save(testReminder);
    }

    @Test
    @DisplayName("Should mark all reminders as read for user")
    void testMarkAllRemindersAsRead() {
        // Arrange
        List<Reminder> unreadReminders = Arrays.asList(testReminder);
        when(reminderRepository.findUnreadByUserId(1L)).thenReturn(unreadReminders);
        when(reminderRepository.saveAll(any())).thenReturn(unreadReminders);
        
        // Act
        reminderService.markAllRemindersAsRead(1L);
        
        // Assert
        verify(reminderRepository).findUnreadByUserId(1L);
        verify(reminderRepository).saveAll(unreadReminders);
        assertTrue(testReminder.isRead());
    }

    @Test
    @DisplayName("Should handle exception when creating reminders")
    void testCreateSmartHomeworkReminderWithException() {
        // Arrange
        when(userRepository.findByClassGrade("4th Grade"))
            .thenThrow(new RuntimeException("Database error"));
        
        // Act & Assert
        assertDoesNotThrow(() -> reminderService.createSmartHomeworkReminder(testHomework));
    }

    @Test
    @DisplayName("Should handle exception when processing reminders")
    void testProcessPendingRemindersWithException() {
        // Arrange
        when(reminderRepository.findPendingRemindersToSend(any(LocalDateTime.class)))
            .thenThrow(new RuntimeException("Database error"));
        
        // Act & Assert
        assertDoesNotThrow(() -> reminderService.processPendingReminders());
    }

    @Test
    @DisplayName("Should determine correct priority for urgent homework")
    void testDeterminePriorityForUrgentHomework() {
        // Arrange
        testReminder.setDueDate(LocalDateTime.now().minusHours(1)); // Overdue
        
        // Act
        reminderService.processPendingReminders();
        
        // Assert
        verify(notificationService).createNotification(
            anyLong(),
            any(com.homework.entity.Notification.NotificationType.class),
            any(String.class),
            any(String.class),
            anyLong(),
            any(String.class),
            eq(com.homework.entity.Notification.NotificationPriority.URGENT)
        );
    }

    @Test
    @DisplayName("Should determine correct priority for high priority homework")
    void testDeterminePriorityForHighPriorityHomework() {
        // Arrange
        testReminder.setDueDate(LocalDateTime.now().plusMinutes(30)); // Due in 30 minutes
        
        // Act
        reminderService.processPendingReminders();
        
        // Assert
        verify(notificationService).createNotification(
            anyLong(),
            any(com.homework.entity.Notification.NotificationType.class),
            any(String.class),
            any(String.class),
            anyLong(),
            any(String.class),
            eq(com.homework.entity.Notification.NotificationPriority.HIGH)
        );
    }

    private Notification createTestNotification() {
        Notification notification = new Notification();
        notification.setId(1L);
        notification.setUserId(1L);
        notification.setType(com.homework.entity.Notification.NotificationType.REMINDER);
        notification.setTitle("Test Notification");
        notification.setMessage("Test message");
        notification.setHomeworkId(1L);
        notification.setHomeworkTitle("Test Homework");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notification;
    }
}
