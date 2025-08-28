package com.homework.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.entity.HomeworkSubmission;
import com.homework.dto.HomeworkSubmissionRequest;
import com.homework.dto.HomeworkSubmissionResponse;
import com.homework.enums.UserRole;
import com.homework.repository.HomeworkSubmissionRepository;
import com.homework.repository.UserRepository;
import com.homework.repository.HomeworkRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class HomeworkSubmissionServiceTest {

    @InjectMocks
    private HomeworkSubmissionService submissionService;

    @Mock
    private HomeworkSubmissionRepository submissionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HomeworkRepository homeworkRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private GamificationService gamificationService;

    private User testStudent;
    private User testTeacher;
    private Homework testHomework;
    private HomeworkSubmission testSubmission;
    private HomeworkSubmissionRequest testRequest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Setup test data
        testStudent = new User();
        testStudent.setId(1L);
        testStudent.setEmail("student@example.com");
        testStudent.setRole(UserRole.STUDENT);
        testStudent.setClassGrade("4th Grade");
        testStudent.setFirstName("John");
        testStudent.setLastName("Doe");
        
        testTeacher = new User();
        testTeacher.setId(2L);
        testTeacher.setEmail("teacher@example.com");
        testTeacher.setRole(UserRole.TEACHER);
        testTeacher.setFirstName("Jane");
        testTeacher.setLastName("Smith");
        
        testHomework = new Homework();
        testHomework.setId(1L);
        testHomework.setTitle("Test Homework");
        testHomework.setSubject("Math");
        testHomework.setClassGrade("4th Grade");
        testHomework.setDueDate(LocalDateTime.now().plusDays(7));
        testHomework.setTeacherId(2L);
        
        testSubmission = new HomeworkSubmission();
        testSubmission.setId(1L);
        testSubmission.setHomeworkId(1L);
        testSubmission.setStudentId(1L);
        testSubmission.setSubmissionText("Test submission");
        testSubmission.setSubmittedAt(LocalDateTime.now());
        testSubmission.setStatus(HomeworkSubmission.SubmissionStatus.SUBMITTED);
        
        testRequest = new HomeworkSubmissionRequest();
        testRequest.setHomeworkId(1L);
        testRequest.setSubmissionText("Test submission text");
        testRequest.setSubmissionType("TEXT");
    }

    @Test
    @DisplayName("Should submit homework successfully")
    void testSubmitHomework() {
        // Arrange
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(testStudent));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        when(submissionRepository.existsByHomeworkIdAndStudentId(1L, 1L)).thenReturn(false);
        when(submissionRepository.save(any(HomeworkSubmission.class))).thenReturn(testSubmission);
        doNothing().when(notificationService).createSubmissionNotification(any(HomeworkSubmission.class), anyString());
        doNothing().when(gamificationService).processHomeworkSubmission(any(HomeworkSubmission.class));
        
        // Act
        HomeworkSubmissionResponse result = submissionService.submitHomework(testRequest, "student@example.com");
        
        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getHomeworkId());
        assertEquals(1L, result.getStudentId());
        verify(submissionRepository).save(any(HomeworkSubmission.class));
        verify(notificationService).createSubmissionNotification(any(HomeworkSubmission.class), anyString());
        verify(gamificationService).processHomeworkSubmission(any(HomeworkSubmission.class));
    }

    @Test
    @DisplayName("Should throw exception when student not found")
    void testSubmitHomeworkStudentNotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            submissionService.submitHomework(testRequest, "nonexistent@example.com");
        });
        
        verify(submissionRepository, never()).save(any(HomeworkSubmission.class));
    }

    @Test
    @DisplayName("Should throw exception when homework not found")
    void testSubmitHomeworkHomeworkNotFound() {
        // Arrange
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(testStudent));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            submissionService.submitHomework(testRequest, "student@example.com");
        });
        
        verify(submissionRepository, never()).save(any(HomeworkSubmission.class));
    }

    @Test
    @DisplayName("Should throw exception when student already submitted")
    void testSubmitHomeworkAlreadySubmitted() {
        // Arrange
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(testStudent));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        when(submissionRepository.existsByHomeworkIdAndStudentId(1L, 1L)).thenReturn(true);
        
        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            submissionService.submitHomework(testRequest, "student@example.com");
        });
        
        verify(submissionRepository, never()).save(any(HomeworkSubmission.class));
    }

    @Test
    @DisplayName("Should submit homework with voice recording")
    void testSubmitHomeworkWithVoiceRecording() {
        // Arrange
        testRequest.setAudioData("base64_audio_data");
        testRequest.setSubmissionType("VOICE");
        
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(testStudent));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        when(submissionRepository.existsByHomeworkIdAndStudentId(1L, 1L)).thenReturn(false);
        when(submissionRepository.save(any(HomeworkSubmission.class))).thenReturn(testSubmission);
        doNothing().when(notificationService).createSubmissionNotification(any(HomeworkSubmission.class), anyString());
        doNothing().when(gamificationService).processHomeworkSubmission(any(HomeworkSubmission.class));
        
        // Act
        HomeworkSubmissionResponse result = submissionService.submitHomework(testRequest, "student@example.com");
        
        // Assert
        assertNotNull(result);
        verify(submissionRepository).save(any(HomeworkSubmission.class));
    }

    @Test
    @DisplayName("Should grade submission successfully")
    void testGradeSubmission() {
        // Arrange
        when(userRepository.findByEmail("teacher@example.com")).thenReturn(Optional.of(testTeacher));
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(testSubmission));
        when(submissionRepository.save(any(HomeworkSubmission.class))).thenReturn(testSubmission);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        doNothing().when(notificationService).createGradedNotification(any(HomeworkSubmission.class), anyString());
        doNothing().when(gamificationService).processHomeworkGrading(any(HomeworkSubmission.class));
        
        // Act
        HomeworkSubmissionResponse result = submissionService.gradeSubmission(1L, 85, "Good work!", "teacher@example.com");
        
        // Assert
        assertNotNull(result);
        assertEquals(85, testSubmission.getGrade());
        assertEquals("Good work!", testSubmission.getFeedback());
        assertEquals(HomeworkSubmission.SubmissionStatus.GRADED, testSubmission.getStatus());
        verify(submissionRepository).save(testSubmission);
        verify(notificationService).createGradedNotification(any(HomeworkSubmission.class), anyString());
        verify(gamificationService).processHomeworkGrading(any(HomeworkSubmission.class));
    }

    @Test
    @DisplayName("Should get homework submissions by homework ID")
    void testGetHomeworkSubmissions() {
        // Arrange
        List<HomeworkSubmission> submissions = Arrays.asList(testSubmission);
        when(submissionRepository.findByHomeworkId(1L)).thenReturn(submissions);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        
        // Act
        List<HomeworkSubmissionResponse> result = submissionService.getHomeworkSubmissions(1L);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getHomeworkId());
        verify(submissionRepository).findByHomeworkId(1L);
    }

    @Test
    @DisplayName("Should get student submissions")
    void testGetStudentSubmissions() {
        // Arrange
        List<HomeworkSubmission> submissions = Arrays.asList(testSubmission);
        when(submissionRepository.findByStudentId(1L)).thenReturn(submissions);
        when(homeworkRepository.findById(1L)).thenReturn(Optional.of(testHomework));
        
        // Act
        List<HomeworkSubmissionResponse> result = submissionService.getStudentSubmissions(1L);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getStudentId());
        verify(submissionRepository).findByStudentId(1L);
    }
}
