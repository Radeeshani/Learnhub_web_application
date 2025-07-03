package com.homework.controller;

import com.homework.dto.AuthResponse;
import com.homework.dto.LoginRequest;
import com.homework.dto.RegisterRequest;
import com.homework.entity.User;
import com.homework.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.getUserByEmail(loginRequest.getEmail());
            
            if (user == null || !user.getPassword().equals(loginRequest.getPassword())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            AuthResponse authResponse = new AuthResponse();
            authResponse.setId(user.getId());
            authResponse.setEmail(user.getEmail());
            authResponse.setFirstName(user.getFirstName());
            authResponse.setLastName(user.getLastName());
            authResponse.setRole(user.getRole());
            authResponse.setClassGrade(user.getClassGrade());
            authResponse.setSubjectTaught(user.getSubjectTaught());
            authResponse.setStudentId(user.getStudentId());
            authResponse.setParentOfStudentId(user.getParentOfStudentId());
            
            return ResponseEntity.ok(authResponse);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Check if email already exists
            if (userService.emailExists(registerRequest.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email already exists");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Create new user
            User user = new User();
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(registerRequest.getPassword());
            user.setRole(registerRequest.getRole());
            user.setPhoneNumber(registerRequest.getPhoneNumber());
            user.setClassGrade(registerRequest.getClassGrade());
            user.setSubjectTaught(registerRequest.getSubjectTaught());
            user.setStudentId(registerRequest.getStudentId());
            user.setParentOfStudentId(registerRequest.getParentOfStudentId());
            
            User savedUser = userService.createUser(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", savedUser.getId().toString());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
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
            // Extract email from Authorization header (Bearer token)
            String email = authHeader.substring(7); // Remove "Bearer " prefix
            
            User user = userService.getUserByEmail(email);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            AuthResponse userInfo = new AuthResponse();
            userInfo.setId(user.getId());
            userInfo.setEmail(user.getEmail());
            userInfo.setFirstName(user.getFirstName());
            userInfo.setLastName(user.getLastName());
            userInfo.setRole(user.getRole());
            userInfo.setClassGrade(user.getClassGrade());
            userInfo.setSubjectTaught(user.getSubjectTaught());
            userInfo.setStudentId(user.getStudentId());
            userInfo.setParentOfStudentId(user.getParentOfStudentId());
            
            return ResponseEntity.ok(userInfo);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get user info: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
} 