package com.homework.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.entity.Class;
import com.homework.dto.HomeworkRequest;
import com.homework.enums.UserRole;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.UserRepository;
import com.homework.repository.ClassRepository;
import com.homework.repository.ReminderRepository;
import com.homework.repository.NotificationRepository;
import com.homework.repository.HomeworkSubmissionRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class HomeworkServiceTest {

    @InjectMocks
    private HomeworkService homeworkService;

    @Mock
    private HomeworkRepository homeworkRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClassRepository classRepository;

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private HomeworkSubmissionRepository submissionRepository;

    @Mock
    private ReminderService reminderService;

    @Mock
    private NotificationService notificationService;

    private User testTeacher;
    private Homework testHomework;
    private HomeworkRequest testRequest;
    private Class testClass;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Setup test data
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@example.com");
        testTeacher.setRole(UserRole.TEACHER);
        testTeacher.setFirstName("John");
        testTeacher.setLastName("Doe");
        
        testClass = new Class();
        testClass.setId(1L);
        testClass.setClassName("Math Class");
        testClass.setSubject("Mathematics");
        testClass.setGradeLevel("4th Grade");
        
        testHomework = new Homework();
        testHomework.setId(1L);
        testHomework.setTitle("Test Homework");
        testHomework.setDescription("Test Description");
        testHomework.setSubject("Math");
        testHomework.setClassGrade("4th Grade");
        testHomework.setGrade(85);
        testHomework.setDueDate(LocalDateTime.now().plusDays(7));
        testHomework.setTeacherId(1L);
        
        testRequest = new HomeworkRequest();
        testRequest.setTitle("Test Homework");
        testRequest.setDescription("Test Description");
        testRequest.setSubject("Math");
        testRequest.setClassGrade("4th Grade");
        testRequest.setGrade(85);
        testRequest.setClassId(1L);
        testRequest.setDueDate(LocalDateTime.now().plusDays(7));
    }

    @Test
    @DisplayName("Should create homework successfully")
    void testCreateHomework() throws Exception {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(classRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(homeworkRepository.save(any(Homework.class))).thenReturn(testHomework);
        doNothing().when(notificationService).createNewHomeworkNotification(any(Homework.class));
        doNothing().when(reminderService).createSmartHomeworkReminder(any(Homework.class));
        
        // Act
        Homework result = homeworkService.createHomework(testRequest, null, "teacher@example.com");
        
        // Assert
        assertNotNull(result);
        assertEquals("Test Homework", result.getTitle());
        assertEquals("Math", result.getSubject());
        verify(homeworkRepository).save(any(Homework.class));
        verify(notificationService).createNewHomeworkNotification(any(Homework.class));
        verify(reminderService).createSmartHomeworkReminder(any(Homework.class));
    }

    @Test
    @DisplayName("Should create homework with file attachment")
    void testCreateHomeworkWithFile() throws Exception {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(classRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(homeworkRepository.save(any(Homework.class))).thenReturn(testHomework);
        doNothing().when(notificationService).createNewHomeworkNotification(any(Homework.class));
        doNothing().when(reminderService).createSmartHomeworkReminder(any(Homework.class));
        
        // Mock file
        org.springframework.web.multipart.MultipartFile mockFile = mock(org.springframework.web.multipart.MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn("test.pdf");
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(new java.io.ByteArrayInputStream("test content".getBytes()));
        
        // Act
        Homework result = homeworkService.createHomework(testRequest, mockFile, "teacher@example.com");
        
        // Assert
        assertNotNull(result);
        assertNotNull(result.getFileName());
        assertNotNull(result.getFileUrl());
        verify(homeworkRepository).save(any(Homework.class));
    }

    @Test
    @DisplayName("Should throw exception when teacher not found")
    void testCreateHomeworkTeacherNotFound() {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            homeworkService.createHomework(testRequest, null, "teacher@example.com");
        });
    }

    @Test
    @DisplayName("Should update homework successfully")
    void testUpdateHomework() throws Exception {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        when(classRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(homeworkRepository.save(any(Homework.class))).thenReturn(testHomework);
        
        // Act
        Homework result = homeworkService.updateHomework(1L, testRequest, null, "teacher@example.com");
        
        // Assert
        assertNotNull(result);
        assertEquals("Test Homework", result.getTitle());
        verify(homeworkRepository).save(any(Homework.class));
    }

    @Test
    @DisplayName("Should throw exception when updating homework not owned by teacher")
    void testUpdateHomeworkNotOwned() {
        // Arrange
        testHomework.setTeacherId(999L); // Different teacher
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            homeworkService.updateHomework(1L, testRequest, null, "teacher@example.com");
        });
    }

    @Test
    @DisplayName("Should update homework with new file")
    void testUpdateHomeworkWithNewFile() throws Exception {
        // Arrange
        testHomework.setFileName("old_file.pdf");
        testHomework.setFileUrl("/uploads/homework/old_file.pdf");
        
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        when(classRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(homeworkRepository.save(any(Homework.class))).thenReturn(testHomework);
        
        // Mock new file
        org.springframework.web.multipart.MultipartFile mockFile = mock(org.springframework.web.multipart.MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn("new_file.pdf");
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(new java.io.ByteArrayInputStream("new content".getBytes()));
        
        // Act
        Homework result = homeworkService.updateHomework(1L, testRequest, mockFile, "teacher@example.com");
        
        // Assert
        assertNotNull(result);
        verify(homeworkRepository).save(any(Homework.class));
    }

    @Test
    @DisplayName("Should delete homework successfully")
    void testDeleteHomework() throws Exception {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        when(reminderRepository.findByHomeworkId(1L)).thenReturn(Arrays.asList());
        when(submissionRepository.findByHomeworkId(1L)).thenReturn(Arrays.asList());
        when(notificationRepository.findByHomeworkIdOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList());
        
        // Act
        homeworkService.deleteHomework(1L, "teacher@example.com");
        
        // Assert
        verify(homeworkRepository).delete(testHomework);
    }

    @Test
    @DisplayName("Should throw exception when deleting homework not owned by teacher")
    void testDeleteHomeworkNotOwned() {
        // Arrange
        testHomework.setTeacherId(999L); // Different teacher
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            homeworkService.deleteHomework(1L, "teacher@example.com");
        });
    }

    @Test
    @DisplayName("Should get teacher homework")
    void testGetTeacherHomework() throws Exception {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(homeworkRepository.findByTeacherId(1L)).thenReturn(Arrays.asList(testHomework));
        
        // Act
        List<com.homework.dto.HomeworkResponse> result = homeworkService.getTeacherHomework("teacher@example.com");
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Homework", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Should get homework by ID")
    void testGetHomework() throws Exception {
        // Arrange
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        
        // Act
        Homework result = homeworkService.getHomework(1L);
        
        // Assert
        assertNotNull(result);
        assertEquals("Test Homework", result.getTitle());
    }

    @Test
    @DisplayName("Should throw exception when homework not found")
    void testGetHomeworkNotFound() {
        // Arrange
        when(homeworkRepository.findById(1L)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            homeworkService.getHomework(1L);
        });
    }

    @Test
    @DisplayName("Should get homework by grade")
    void testGetHomeworkByGrade() {
        // Arrange
        when(homeworkRepository.findByClassGrade("4th Grade", any(org.springframework.data.domain.Sort.class)))
            .thenReturn(Arrays.asList(testHomework));
        
        // Act
        List<Homework> result = homeworkService.getHomeworkByGrade("4th Grade");
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("4th Grade", result.get(0).getClassGrade());
    }

    @Test
    @DisplayName("Should handle class linking exception gracefully")
    void testCreateHomeworkWithClassLinkingException() throws Exception {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(classRepository.findById(1L)).thenThrow(new RuntimeException("Class not found"));
        when(homeworkRepository.save(any(Homework.class))).thenReturn(testHomework);
        doNothing().when(notificationService).createNewHomeworkNotification(any(Homework.class));
        doNothing().when(reminderService).createSmartHomeworkReminder(any(Homework.class));
        
        // Act & Assert
        assertDoesNotThrow(() -> {
            homeworkService.createHomework(testRequest, null, "teacher@example.com");
        });
        
        // Verify homework was still created
        verify(homeworkRepository).save(any(Homework.class));
    }

    @Test
    @DisplayName("Should handle file upload exception gracefully")
    void testCreateHomeworkWithFileUploadException() throws Exception {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(classRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(homeworkRepository.save(any(Homework.class))).thenReturn(testHomework);
        doNothing().when(notificationService).createNewHomeworkNotification(any(Homework.class));
        doNothing().when(reminderService).createSmartHomeworkReminder(any(Homework.class));
        
        // Mock file that throws exception
        org.springframework.web.multipart.MultipartFile mockFile = mock(org.springframework.web.multipart.MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn("test.pdf");
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new RuntimeException("File read error"));
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            homeworkService.createHomework(testRequest, mockFile, "teacher@example.com");
        });
    }
}
