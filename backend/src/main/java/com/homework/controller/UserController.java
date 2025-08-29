package com.homework.controller;

import com.homework.dto.AuthResponse;
import com.homework.entity.User;
import com.homework.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> request, 
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Extract user ID from token (you might want to implement this in JwtTokenProvider)
            // For now, we'll get the user from the request body
            String email = (String) request.get("email");
            if (email == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            User existingUser = userService.getUserByEmail(email);
            if (existingUser == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Update user fields
            if (request.containsKey("firstName")) {
                existingUser.setFirstName((String) request.get("firstName"));
            }
            if (request.containsKey("lastName")) {
                existingUser.setLastName((String) request.get("lastName"));
            }
            if (request.containsKey("phoneNumber")) {
                existingUser.setPhoneNumber((String) request.get("phoneNumber"));
            }
            if (request.containsKey("classGrade")) {
                existingUser.setClassGrade((String) request.get("classGrade"));
            }
            if (request.containsKey("subjectTaught")) {
                existingUser.setSubjectTaught((String) request.get("subjectTaught"));
            }
            if (request.containsKey("studentId")) {
                existingUser.setStudentId((String) request.get("studentId"));
            }
            if (request.containsKey("profilePicture")) {
                existingUser.setProfilePicture((String) request.get("profilePicture"));
            }
            if (request.containsKey("address")) {
                existingUser.setAddress((String) request.get("address"));
            }
            if (request.containsKey("parentFirstName")) {
                existingUser.setParentFirstName((String) request.get("parentFirstName"));
            }
            if (request.containsKey("parentLastName")) {
                existingUser.setParentLastName((String) request.get("parentLastName"));
            }

            User updatedUser = userService.updateUser(existingUser);

            // Create response
            AuthResponse response = new AuthResponse();
            response.setId(updatedUser.getId());
            response.setEmail(updatedUser.getEmail());
            response.setFirstName(updatedUser.getFirstName());
            response.setLastName(updatedUser.getLastName());
            response.setRole(updatedUser.getRole().toString());
            response.setClassGrade(updatedUser.getClassGrade());
            response.setParentOfStudentId(updatedUser.getParentOfStudentId() != null ? 
                    updatedUser.getParentOfStudentId().toString() : null);
            response.setSubjectTaught(updatedUser.getSubjectTaught());
            response.setPhoneNumber(updatedUser.getPhoneNumber());
            response.setProfilePicture(updatedUser.getProfilePicture());
            response.setAddress(updatedUser.getAddress());
            response.setParentFirstName(updatedUser.getParentFirstName());
            response.setParentLastName(updatedUser.getParentLastName());

            logger.info("Profile updated successfully for user: {}", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error updating profile", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // For now, we'll return a message indicating this endpoint needs proper JWT implementation
            Map<String, String> message = new HashMap<>();
            message.put("message", "Profile endpoint - JWT token validation needs to be implemented");
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            logger.error("Error getting profile", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, Object> request, 
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Extract password change data
            String email = (String) request.get("email");
            String currentPassword = (String) request.get("currentPassword");
            String newPassword = (String) request.get("newPassword");
            
            if (email == null || currentPassword == null || newPassword == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email, current password, and new password are required");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate new password length
            if (newPassword.length() < 6) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "New password must be at least 6 characters long");
                return ResponseEntity.badRequest().body(error);
            }

            // Get user and verify current password
            User existingUser = userService.getUserByEmail(email);
            if (existingUser == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Verify current password
            if (!userService.verifyPassword(existingUser, currentPassword)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Current password is incorrect");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Update password (encode it before saving)
            existingUser.setPassword(userService.encodePassword(newPassword));
            User updatedUser = userService.updateUser(existingUser);

            // Create response
            AuthResponse response = new AuthResponse();
            response.setId(updatedUser.getId());
            response.setEmail(updatedUser.getEmail());
            response.setFirstName(updatedUser.getFirstName());
            response.setLastName(updatedUser.getLastName());
            response.setRole(updatedUser.getRole().toString());
            response.setClassGrade(updatedUser.getClassGrade());
            response.setParentOfStudentId(updatedUser.getParentOfStudentId() != null ? 
                    updatedUser.getParentOfStudentId().toString() : null);
            response.setSubjectTaught(updatedUser.getSubjectTaught());
            response.setPhoneNumber(updatedUser.getPhoneNumber());
            response.setProfilePicture(updatedUser.getProfilePicture());

            logger.info("Password changed successfully for user: {}", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error changing password", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
