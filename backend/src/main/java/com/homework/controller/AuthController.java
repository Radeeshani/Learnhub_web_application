package com.homework.controller;

import com.homework.dto.AuthResponse;
import com.homework.dto.LoginRequest;
import com.homework.dto.RegisterRequest;
import com.homework.entity.User;
import com.homework.enums.UserRole;
import com.homework.security.JwtTokenProvider;
import com.homework.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        logger.debug("Login attempt for email: {}", request.getEmail());
        try {
            User user = userService.loginUser(request.getEmail(), request.getPassword());

            AuthResponse response = new AuthResponse();
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setRole(user.getRole().toString());
            response.setClassGrade(user.getClassGrade());
            response.setParentOfStudentId(user.getParentOfStudentId() != null ? 
                    user.getParentOfStudentId().toString() : null);
            response.setSubjectTaught(user.getSubjectTaught());
            response.setPhoneNumber(user.getPhoneNumber());
            response.setProfilePicture(user.getProfilePicture());
            response.setToken(jwtTokenProvider.generateToken(user.getEmail(), user.getRole().toString(), user.getId()));

            logger.debug("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Login error for email: {}", request.getEmail(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        logger.debug("Registration attempt for email: {}", request.getEmail());
        try {
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setRole(UserRole.valueOf(request.getRole()));
            user.setClassGrade(request.getClassGrade());
            user.setSubjectTaught(request.getSubjectTaught());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setProfilePicture(request.getProfilePicture());

            // If registering as a parent, convert studentId to Long
            if (UserRole.valueOf(request.getRole()) == UserRole.PARENT && request.getParentOfStudentId() != null) {
                user.setParentOfStudentId(Long.parseLong(request.getParentOfStudentId()));
            }

            User savedUser = userService.registerUser(user);

            AuthResponse response = new AuthResponse();
            response.setId(savedUser.getId());
            response.setEmail(savedUser.getEmail());
            response.setFirstName(savedUser.getFirstName());
            response.setLastName(savedUser.getLastName());
            response.setRole(savedUser.getRole().toString());
            response.setClassGrade(savedUser.getClassGrade());
            response.setParentOfStudentId(savedUser.getParentOfStudentId() != null ? 
                    savedUser.getParentOfStudentId().toString() : null);
            response.setSubjectTaught(savedUser.getSubjectTaught());
            response.setPhoneNumber(savedUser.getPhoneNumber());
            response.setProfilePicture(savedUser.getProfilePicture());
            response.setToken(jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().toString(), savedUser.getId()));

            logger.debug("Registration successful for email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            logger.error("Registration error for email: {}", request.getEmail(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix

            if (!jwtTokenProvider.validateToken(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String email = jwtTokenProvider.getEmailFromToken(token);
            logger.debug("Getting current user info for email: {}", email);

            User user = userService.getUserByEmail(email);
            if (user == null) {
                logger.debug("User not found for email: {}", email);
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            AuthResponse userInfo = new AuthResponse();
            userInfo.setId(user.getId());
            userInfo.setEmail(user.getEmail());
            userInfo.setFirstName(user.getFirstName());
            userInfo.setLastName(user.getLastName());
            userInfo.setRole(user.getRole().toString());
            userInfo.setClassGrade(user.getClassGrade());
            userInfo.setParentOfStudentId(user.getParentOfStudentId() != null ? 
                    user.getParentOfStudentId().toString() : null);
            userInfo.setSubjectTaught(user.getSubjectTaught());
            userInfo.setPhoneNumber(user.getPhoneNumber());
            userInfo.setProfilePicture(user.getProfilePicture());

            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            logger.error("Error getting current user info", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get user info: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
} 