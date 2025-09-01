// package com.homework.service;

// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.MockitoAnnotations;
// import com.homework.entity.Homework;
// import com.homework.entity.User;
// import com.homework.entity.Notification;
// import com.homework.entity.HomeworkSubmission;
// import com.homework.enums.UserRole;
// import com.homework.repository.NotificationRepository;
// import com.homework.repository.UserRepository;
// import com.homework.repository.HomeworkRepository;

// import java.time.LocalDateTime;
// import java.time.temporal.ChronoUnit;
// import java.util.Arrays;
// import java.util.List;
// import java.util.Optional;

// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.anyList;
// import static org.mockito.ArgumentMatchers.anyString;
// import static org.mockito.ArgumentMatchers.eq;
// import static org.mockito.Mockito.*;
// import static org.junit.jupiter.api.Assertions.*;

// class NotificationServiceTest {

//     @InjectMocks
//     private NotificationService notificationService;

//     @Mock
//     private NotificationRepository notificationRepository;

//     @Mock
//     private UserRepository userRepository;

//     @Mock
//     private HomeworkRepository homeworkRepository;

//     @Mock
//     private EmailService emailService;

//     private User testStudent;
//     private User testTeacher;
//     private Homework testHomework;
//     private HomeworkSubmission testSubmission;
//     private Notification testNotification;

//     @BeforeEach
//     void setUp() {
//         MockitoAnnotations.openMocks(this);
        
//         // Setup test data
//         testStudent = new User();
//         testStudent.setId(1L);
//         testStudent.setEmail("student@example.com");
//         testStudent.setRole(UserRole.STUDENT);
//         testStudent.setClassGrade("4th Grade");
        
//         testTeacher = new User();
//         testTeacher.setId(2L);
//         testTeacher.setEmail("teacher@example.com");
//         testTeacher.setRole(UserRole.TEACHER);
        
//         testHomework = new Homework();
//         testHomework.setId(1L);
//         testHomework.setTitle("Test Homework");
//         testHomework.setSubject("Math");
//         testHomework.setClassGrade("4th Grade");
//         testHomework.setDueDate(LocalDateTime.now().plusDays(2));
//         testHomework.setTeacherId(2L);
        
//         testSubmission = new HomeworkSubmission();
//         testSubmission.setId(1L);
//         testSubmission.setHomeworkId(1L);
//         testSubmission.setStudentId(1L);
//         testSubmission.setSubmissionText("Test submission");
//         testSubmission.setSubmittedAt(LocalDateTime.now());
        
//         testNotification = new Notification();
//         testNotification.setId(1L);
//         testNotification.setUserId(1L);
//         testNotification.setType(com.homework.entity.Notification.NotificationType.NEW_HOMEWORK);
//         testNotification.setTitle("Test Notification");
//         testNotification.setMessage("Test message");
//         testNotification.setHomeworkId(1L);
//         testNotification.setHomeworkTitle("Test Homework");
//         testNotification.setRead(false);
//         testNotification.setCreatedAt(LocalDateTime.now());
//     }

//     @Test
//     @DisplayName("Should create notification for single user")
//     void testCreateNotification() {
//         // Arrange
//         when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);
        
//         // Act
//         Notification result = notificationService.createNotification(
//             1L,
//             com.homework.entity.Notification.NotificationType.NEW_HOMEWORK,
//             "Test Title",
//             "Test Message",
//             1L,
//             "Test Homework",
//             com.homework.entity.Notification.NotificationPriority.NORMAL
//         );
        
//         // Assert
//         assertNotNull(result);
//         assertEquals(1L, result.getUserId());
//         assertEquals("Test Title", result.getTitle());
//         verify(notificationRepository).save(any(Notification.class));
//     }

//     @Test
//     @DisplayName("Should create bulk notifications for multiple users")
//     void testCreateBulkNotifications() {
//         // Arrange
//         List<Long> userIds = Arrays.asList(1L, 2L, 3L);
//         List<Notification> savedNotifications = Arrays.asList(testNotification);
//         when(notificationRepository.saveAll(anyList())).thenReturn(savedNotifications);
        
//         // Act
//         List<Notification> result = notificationService.createBulkNotifications(
//             userIds,
//             com.homework.entity.Notification.NotificationType.NEW_HOMEWORK,
//             "Test Title",
//             "Test Message",
//             1L,
//             "Test Homework",
//             com.homework.entity.Notification.NotificationPriority.NORMAL
//         );
        
//         // Assert
//         assertNotNull(result);
//         assertEquals(1, result.size());
//         verify(notificationRepository).saveAll(anyList());
//     }

//     @Test
//     @DisplayName("Should create new homework notification for all students")
//     void testCreateNewHomeworkNotification() {
//         // Arrange
//         List<User> students = Arrays.asList(testStudent);
//         when(userRepository.findByRole(UserRole.STUDENT)).thenReturn(students);
//         when(notificationRepository.saveAll(anyList())).thenReturn(Arrays.asList(testNotification));
//         doNothing().when(emailService).sendNewHomeworkNotification(any(User.class), any(Homework.class));
        
//         // Act
//         notificationService.createNewHomeworkNotification(testHomework);
        
//         // Assert
//         verify(userRepository).findByRole(UserRole.STUDENT);
//         verify(notificationRepository).saveAll(anyList());
//         verify(emailService).sendNewHomeworkNotification(testStudent, testHomework);
//     }

//     @Test
//     @DisplayName("Should create submission notification for teacher")
//     void testCreateSubmissionNotification() {
//         // Arrange
//         when(userRepository.findById(2L)).thenReturn(Optional.of(testTeacher));
//         when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);
//         doNothing().when(emailService).sendSubmissionNotification(any(User.class), any(Homework.class));
        
//         // Act
//         notificationService.createSubmissionNotification(testSubmission, testHomework.getTitle());
        
//         // Assert
//         verify(notificationRepository).save(any(Notification.class));
//         verify(emailService).sendSubmissionNotification(testTeacher, testHomework);
//     }

//     @Test
//     @DisplayName("Should create graded notification for student")
//     void testCreateGradedNotification() {
//         // Arrange
//         testSubmission.setGrade(85);
//         testSubmission.setFeedback("Good work!");
//         when(userRepository.findById(1L)).thenReturn(Optional.of(testStudent));
//         when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
//         when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);
//         doNothing().when(emailService).sendGradedNotification(any(User.class), any(Homework.class), anyString(), anyString());
        
//         // Act
//         notificationService.createGradedNotification(testSubmission, testHomework.getTitle());
        
//         // Assert
//         verify(notificationRepository).save(any(Notification.class));
//         verify(emailService).sendGradedNotification(testStudent, testHomework, "85", "Good work!");
//     }

//     @Test
//     @DisplayName("Should create due soon notification for homework due within 3 days")
//     void testCreateDueSoonNotification() {
//         // Arrange
//         testHomework.setDueDate(LocalDateTime.now().plusDays(2)); // Due in 2 days
//         List<User> students = Arrays.asList(testStudent);
//         when(userRepository.findByRole(UserRole.STUDENT)).thenReturn(students);
//         when(notificationRepository.saveAll(anyList())).thenReturn(Arrays.asList(testNotification));
        
//         // Act
//         notificationService.createDueSoonNotification(testHomework);
        
//         // Assert
//         verify(userRepository).findByRole(UserRole.STUDENT);
//         verify(notificationRepository).saveAll(anyList());
//     }

//     @Test
//     @DisplayName("Should not create due soon notification for homework due in more than 3 days")
//     void testCreateDueSoonNotificationForFutureHomework() {
//         // Arrange
//         testHomework.setDueDate(LocalDateTime.now().plusDays(5)); // Due in 5 days
//         List<User> students = Arrays.asList(testStudent);
//         when(userRepository.findByRole(UserRole.STUDENT)).thenReturn(students);
        
//         // Act
//         notificationService.createDueSoonNotification(testHomework);
        
//         // Assert
//         verify(userRepository).findByRole(UserRole.STUDENT);
//         verify(notificationRepository, never()).saveAll(anyList());
//     }

//     @Test
//     @DisplayName("Should create overdue notification for past due homework")
//     void testCreateOverdueNotification() {
//         // Arrange
//         testHomework.setDueDate(LocalDateTime.now().minusDays(1)); // Overdue
//         List<User> students = Arrays.asList(testStudent);
//         when(userRepository.findByRole(UserRole.STUDENT)).thenReturn(students);
//         when(notificationRepository.saveAll(anyList())).thenReturn(Arrays.asList(testNotification));
        
//         // Act
//         notificationService.createOverdueNotification(testHomework);
        
//         // Assert
//         verify(userRepository).findByRole(UserRole.STUDENT);
//         verify(notificationRepository).saveAll(anyList());
//     }

//     @Test
//     @DisplayName("Should get user notifications")
//     void testGetUserNotifications() {
//         // Arrange
//         List<Notification> notifications = Arrays.asList(testNotification);
//         when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(notifications);
        
//         // Act
//         List<Notification> result = notificationService.getUserNotifications(1L);
        
//         // Assert
//         assertNotNull(result);
//         assertEquals(1, result.size());
//         verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(1L);
//     }

//     @Test
//     @DisplayName("Should get user unread notifications")
//     void testGetUserUnreadNotifications() {
//         // Arrange
//         List<Notification> notifications = Arrays.asList(testNotification);
//         when(notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(1L, false)).thenReturn(notifications);
        
//         // Act
//         List<Notification> result = notificationService.getUserUnreadNotifications(1L);
        
//         // Assert
//         assertNotNull(result);
//         assertEquals(1, result.size());
//         verify(notificationRepository).findByUserIdAndReadOrderByCreatedAtDesc(1L, false);
//     }

//     @Test
//     @DisplayName("Should mark notification as read")
//     void testMarkAsRead() {
//         // Arrange
//         when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
//         when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);
        
//         // Act
//         Notification result = notificationService.markAsRead(1L);
        
//         // Assert
//         assertNotNull(result);
//         assertTrue(result.isRead());
//         assertNotNull(result.getReadAt());
//         verify(notificationRepository).save(testNotification);
//     }

//     @Test
//     @DisplayName("Should mark all notifications as read for user")
//     void testMarkAllAsRead() {
//         // Arrange
//         List<Notification> notifications = Arrays.asList(testNotification);
//         when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(notifications);
//         when(notificationRepository.saveAll(anyList())).thenReturn(notifications);
        
//         // Act
//         notificationService.markAllAsRead(1L);
        
//         // Assert
//         verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(1L);
//         verify(notificationRepository).saveAll(notifications);
//         assertTrue(testNotification.isRead());
//     }

//     @Test
//     @DisplayName("Should get reminder notifications by user ID")
//     void testGetReminderNotificationsByUserId() {
//         // Arrange
//         List<Notification> notifications = Arrays.asList(testNotification);
//         when(notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(
//             1L, com.homework.entity.Notification.NotificationType.REMINDER))
//             .thenReturn(notifications);
        
//         // Act
//         List<Notification> result = notificationService.getReminderNotificationsByUserId(1L);
        
//         // Assert
//         assertNotNull(result);
//         assertEquals(1, result.size());
//         verify(notificationRepository).findByUserIdAndTypeOrderByCreatedAtDesc(
//             1L, com.homework.entity.Notification.NotificationType.REMINDER);
//     }

//     @Test
//     @DisplayName("Should handle exception when creating notification")
//     void testCreateNotificationWithException() {
//         // Arrange
//         when(notificationRepository.save(any(Notification.class)))
//             .thenThrow(new RuntimeException("Database error"));
        
//         // Act & Assert
//         assertThrows(RuntimeException.class, () -> {
//             notificationService.createNotification(
//                 1L,
//                 com.homework.entity.Notification.NotificationType.NEW_HOMEWORK,
//                 "Test Title",
//                 "Test Message",
//                 1L,
//                 "Test Homework",
//                 com.homework.entity.Notification.NotificationPriority.NORMAL
//             );
//         });
//     }

//     @Test
//     @DisplayName("Should handle exception when creating bulk notifications")
//     void testCreateBulkNotificationsWithException() {
//         // Arrange
//         List<Long> userIds = Arrays.asList(1L, 2L);
//         when(notificationRepository.saveAll(anyList()))
//             .thenThrow(new RuntimeException("Database error"));
        
//         // Act & Assert
//         assertThrows(RuntimeException.class, () -> {
//             notificationService.createBulkNotifications(
//                 userIds,
//                 com.homework.entity.Notification.NotificationType.NEW_HOMEWORK,
//                 "Test Title",
//                 "Test Message",
//                 1L,
//                 "Test Homework",
//                 com.homework.entity.Notification.NotificationPriority.NORMAL
//             );
//         });
//     }

//     @Test
//     @DisplayName("Should handle email service exception gracefully")
//     void testCreateNewHomeworkNotificationWithEmailException() {
//         // Arrange
//         List<User> students = Arrays.asList(testStudent);
//         when(userRepository.findByRole(UserRole.STUDENT)).thenReturn(students);
//         when(notificationRepository.saveAll(anyList())).thenReturn(Arrays.asList(testNotification));
//         doThrow(new RuntimeException("Email service error"))
//             .when(emailService).sendNewHomeworkNotification(any(User.class), any(Homework.class));
        
//         // Act & Assert
//         assertDoesNotThrow(() -> notificationService.createNewHomeworkNotification(testHomework));
//         verify(notificationRepository).saveAll(anyList());
//     }
// }
