package com.homework.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.homework.entity.User;
import com.homework.enums.UserRole;
import com.homework.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Setup test data
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setRole(UserRole.STUDENT);
        testUser.setClassGrade("4th Grade");
        testUser.setIsActive(true);
        testUser.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should register new user successfully")
    void testRegisterUser() throws Exception {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        testUser.setPassword("password123");
        
        // Act
        User result = userService.registerUser(testUser);
        
        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering user with existing email")
    void testRegisterUserWithExistingEmail() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            userService.registerUser(testUser);
        });
        
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should authenticate user successfully")
    void testLoginUser() throws Exception {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        
        // Act
        User result = userService.loginUser("test@example.com", "password123");
        
        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", "encodedPassword");
    }

    @Test
    @DisplayName("Should throw exception when authenticating with wrong password")
    void testLoginUserWrongPassword() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            userService.loginUser("test@example.com", "wrongpassword");
        });
    }

    @Test
    @DisplayName("Should throw exception when authenticating non-existent user")
    void testLoginUserNotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            userService.loginUser("nonexistent@example.com", "password123");
        });
    }

    @Test
    @DisplayName("Should get user by ID successfully")
    void testGetUserById() throws Exception {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        
        // Act
        User result = userService.getUserById(1L);
        
        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    @DisplayName("Should throw exception when getting non-existent user by ID")
    void testGetUserByIdNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            userService.getUserById(999L);
        });
    }

    @Test
    @DisplayName("Should get user by email successfully")
    void testGetUserByEmail() throws Exception {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        
        // Act
        User result = userService.getUserByEmail("test@example.com");
        
        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    @DisplayName("Should throw exception when getting non-existent user by email")
    void testGetUserByEmailNotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            userService.getUserByEmail("nonexistent@example.com");
        });
    }

    @Test
    @DisplayName("Should check if email exists")
    void testEmailExists() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());
        
        // Act & Assert
        assertTrue(userService.emailExists("test@example.com"));
        assertFalse(userService.emailExists("nonexistent@example.com"));
    }

    @Test
    @DisplayName("Should update user successfully")
    void testUpdateUser() {
        // Arrange
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        // Act
        User result = userService.updateUser(testUser);
        
        // Assert
        assertNotNull(result);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should delete user successfully")
    void testDeleteUser() {
        // Arrange
        doNothing().when(userRepository).deleteById(1L);
        
        // Act
        userService.deleteUser(1L);
        
        // Assert
        verify(userRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should handle password encoding exception gracefully")
    void testRegisterUserWithPasswordEncodingException() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenThrow(new RuntimeException("Encoding error"));
        
        testUser.setPassword("password123");
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            userService.registerUser(testUser);
        });
        
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should handle user save exception gracefully")
    void testRegisterUserWithSaveException() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));
        
        testUser.setPassword("password123");
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            userService.registerUser(testUser);
        });
    }
}
