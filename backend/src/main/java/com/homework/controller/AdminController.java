package com.homework.controller;

import com.homework.service.AdminService;
import com.homework.entity.User;
import com.homework.enums.UserRole;
import com.homework.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    /**
     * Get comprehensive system statistics for admin dashboard
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            Map<String, Object> stats = adminService.getSystemStatistics();
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Error getting dashboard stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get dashboard statistics"));
        }
    }
    
    /**
     * Get user management data
     */
    @GetMapping("/users")
    public ResponseEntity<?> getUserManagementData(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            Map<String, Object> userData = adminService.getUserManagementData();
            return ResponseEntity.ok(userData);
            
        } catch (Exception e) {
            logger.error("Error getting user management data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get user management data"));
        }
    }
    
    /**
     * Get all users for user management
     */
    @GetMapping("/users/all")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            List<User> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
            
        } catch (Exception e) {
            logger.error("Error getting all users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get users"));
        }
    }
    
    /**
     * Create a new user
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestHeader("Authorization") String authHeader, @RequestBody User user) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            User createdUser = adminService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
            
        } catch (Exception e) {
            logger.error("Error creating user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }
    
    /**
     * Update an existing user
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String authHeader, @PathVariable Long id, @RequestBody User user) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            user.setId(id);
            User updatedUser = adminService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
            
        } catch (Exception e) {
            logger.error("Error updating user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update user: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a user (soft delete - marks as inactive)
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            adminService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
            
        } catch (Exception e) {
            logger.error("Error deleting user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }
    
    /**
     * Get system health metrics
     */
    @GetMapping("/system/health")
    public ResponseEntity<?> getSystemHealth(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            Map<String, Object> health = adminService.getSystemHealth();
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            logger.error("Error getting system health", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get system health"));
        }
    }
    
    /**
     * Get recent system activities
     */
    @GetMapping("/activities")
    public ResponseEntity<?> getRecentActivities(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            Map<String, Object> activities = adminService.getRecentActivities();
            return ResponseEntity.ok(activities);
            
        } catch (Exception e) {
            logger.error("Error getting recent activities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get recent activities"));
        }
    }
    
    /**
     * Update user role
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            String newRoleStr = request.get("role");
            if (newRoleStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
            }
            
            UserRole newRole;
            try {
                newRole = UserRole.valueOf(newRoleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + newRoleStr));
            }
            
            User updatedUser = adminService.updateUserRole(userId, newRole);
            return ResponseEntity.ok(updatedUser);
            
        } catch (Exception e) {
            logger.error("Error updating user role", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update user role"));
        }
    }
    
    /**
     * Deactivate user account
     */
    @PutMapping("/users/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            User deactivatedUser = adminService.deactivateUser(userId);
            return ResponseEntity.ok(Map.of(
                "message", "User deactivated successfully",
                "user", deactivatedUser
            ));
            
        } catch (Exception e) {
            logger.error("Error deactivating user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to deactivate user"));
        }
    }
    
    /**
     * Get user statistics
     */
    @GetMapping("/users/{userId}/stats")
    public ResponseEntity<?> getUserStats(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            Map<String, Object> userStats = adminService.getUserStatistics(userId);
            return ResponseEntity.ok(userStats);
            
        } catch (Exception e) {
            logger.error("Error getting user statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get user statistics"));
        }
    }
    
    /**
     * Get user by ID
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminOrTeacherToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin or Teacher access required"));
            }
            
            User user = adminService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(user);
            
        } catch (Exception e) {
            logger.error("Error getting user by ID", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get user: " + e.getMessage()));
        }
    }
    
    /**
     * Send system-wide announcement
     */
    @PostMapping("/announcements")
    public ResponseEntity<?> sendAnnouncement(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            String targetRoleStr = (String) request.get("targetRole");
            
            if (title == null || message == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Title and message are required"));
            }
            
            UserRole targetRole = null;
            if (targetRoleStr != null && !targetRoleStr.isEmpty()) {
                try {
                    targetRole = UserRole.valueOf(targetRoleStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid target role: " + targetRoleStr));
                }
            }
            
            adminService.sendSystemAnnouncement(title, message, targetRole);
            
            return ResponseEntity.ok(Map.of(
                "message", "Announcement sent successfully",
                "targetRole", targetRole != null ? targetRole.toString() : "ALL_USERS"
            ));
            
        } catch (Exception e) {
            logger.error("Error sending announcement", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send announcement"));
        }
    }
    
    /**
     * Get system performance metrics
     */
    @GetMapping("/system/performance")
    public ResponseEntity<?> getPerformanceMetrics(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            Map<String, Object> metrics = adminService.getPerformanceMetrics();
            return ResponseEntity.ok(metrics);
            
        } catch (Exception e) {
            logger.error("Error getting performance metrics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get performance metrics"));
        }
    }
    
    /**
     * Test endpoint to verify admin controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Admin controller is working! 🚀");
    }
    
    /**
     * Public test endpoint to verify database connectivity
     */
    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test basic database operations through AdminService
            try {
                Map<String, Object> stats = adminService.getSystemStatistics();
                result.put("stats", stats);
                result.put("statsStatus", "SUCCESS");
            } catch (Exception e) {
                result.put("stats", "ERROR: " + e.getMessage());
                result.put("statsStatus", "FAILED");
                e.printStackTrace();
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Database test error: " + e.getMessage()));
        }
    }
    
    /**
     * Simple test endpoint for debugging
     */
    @GetMapping("/debug")
    public ResponseEntity<?> debug(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Admin access confirmed",
                "timestamp", LocalDateTime.now(),
                "status", "success"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Debug error: " + e.getMessage()));
        }
    }
    
    /**
     * Test individual admin service methods
     */
    @GetMapping("/debug/service")
    public ResponseEntity<?> debugService(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            
            Map<String, Object> result = new HashMap<>();
            
            try {
                // Test system statistics
                result.put("stats", adminService.getSystemStatistics());
                result.put("statsStatus", "SUCCESS");
            } catch (Exception e) {
                result.put("stats", "ERROR: " + e.getMessage());
                result.put("statsStatus", "FAILED");
                e.printStackTrace();
            }
            
            try {
                // Test user management data
                result.put("users", adminService.getUserManagementData());
                result.put("usersStatus", "SUCCESS");
            } catch (Exception e) {
                result.put("users", "ERROR: " + e.getMessage());
                result.put("usersStatus", "FAILED");
                e.printStackTrace();
            }
            
            try {
                // Test system health
                result.put("health", adminService.getSystemHealth());
                result.put("healthStatus", "SUCCESS");
            } catch (Exception e) {
                result.put("health", "ERROR: " + e.getMessage());
                result.put("healthStatus", "FAILED");
                e.printStackTrace();
            }
            
            try {
                // Test recent activities
                result.put("activities", adminService.getRecentActivities());
                result.put("activitiesStatus", "SUCCESS");
            } catch (Exception e) {
                result.put("activities", "ERROR: " + e.getMessage());
                result.put("activitiesStatus", "FAILED");
                e.printStackTrace();
            }
            
            try {
                // Test performance metrics
                result.put("performance", adminService.getPerformanceMetrics());
                result.put("performanceStatus", "SUCCESS");
            } catch (Exception e) {
                result.put("performance", "ERROR: " + e.getMessage());
                result.put("performanceStatus", "FAILED");
                e.printStackTrace();
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Service debug error: " + e.getMessage()));
        }
    }
    
    /**
     * Validate that the token belongs to an admin user
     */
    private boolean validateAdminToken(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return false;
            }
            
            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return false;
            }
            
            String role = jwtTokenProvider.getRoleFromToken(token);
            return "ADMIN".equals(role);
            
        } catch (Exception e) {
            logger.error("Error validating admin token", e);
            return false;
        }
    }
    
    /**
     * Validate that the token belongs to an admin or teacher user
     */
    private boolean validateAdminOrTeacherToken(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return false;
            }
            
            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return false;
            }
            
            String role = jwtTokenProvider.getRoleFromToken(token);
            return "ADMIN".equals(role) || "TEACHER".equals(role);
            
        } catch (Exception e) {
            logger.error("Error validating admin or teacher token", e);
            return false;
        }
    }
}
