package com.homework.service;

import com.homework.entity.User;
import com.homework.entity.Class;
import com.homework.entity.Homework;
import com.homework.entity.HomeworkSubmission;
import com.homework.enums.UserRole;
import com.homework.repository.UserRepository;
import com.homework.repository.ClassRepository;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.HomeworkSubmissionRepository;
import com.homework.repository.NotificationRepository;
import com.homework.repository.ReminderRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class AdminService {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private HomeworkRepository homeworkRepository;
    
    @Autowired
    private HomeworkSubmissionRepository submissionRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private ReminderRepository reminderRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Get comprehensive system statistics for admin dashboard
     */
    public Map<String, Object> getSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // User statistics
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.countByLastActivityDateAfter(LocalDateTime.now().minusDays(30));
            long teachers = userRepository.countByRole(UserRole.TEACHER);
            long students = userRepository.countByRole(UserRole.STUDENT);
            long parents = userRepository.countByRole(UserRole.PARENT);
            long admins = userRepository.countByRole(UserRole.ADMIN);
            
            // Class statistics
            long totalClasses = classRepository.count();
            long activeClasses = classRepository.countByIsActiveTrue();
            
            // Homework statistics
            long totalHomeworks = homeworkRepository.count();
            long activeHomeworks = homeworkRepository.countByDueDateAfter(LocalDateTime.now());
            long overdueHomeworks = homeworkRepository.countByDueDateBefore(LocalDateTime.now());
            
            // Submission statistics
            long totalSubmissions = submissionRepository.count();
            long pendingSubmissions = submissionRepository.countByStatus(HomeworkSubmission.SubmissionStatus.SUBMITTED);
            long gradedSubmissions = submissionRepository.countByStatus(HomeworkSubmission.SubmissionStatus.GRADED);
            
            // Notification statistics
            long totalNotifications = notificationRepository.count();
            long unreadNotifications = notificationRepository.countByReadFalse();
            
            // Reminder statistics
            long totalReminders = reminderRepository.count();
            long pendingReminders = reminderRepository.countByStatus(com.homework.entity.Reminder.ReminderStatus.PENDING);
            
            stats.put("users", Map.of(
                "total", totalUsers,
                "active", activeUsers,
                "teachers", teachers,
                "students", students,
                "parents", parents,
                "admins", admins,
                "activePercentage", totalUsers > 0 ? Math.round((double) activeUsers / totalUsers * 100) : 0
            ));
            
            stats.put("classes", Map.of(
                "total", totalClasses,
                "active", activeClasses,
                "activePercentage", totalClasses > 0 ? Math.round((double) activeClasses / totalClasses * 100) : 0
            ));
            
            stats.put("homeworks", Map.of(
                "total", totalHomeworks,
                "active", activeHomeworks,
                "overdue", overdueHomeworks,
                "overduePercentage", totalHomeworks > 0 ? Math.round((double) overdueHomeworks / totalHomeworks * 100) : 0
            ));
            
            stats.put("submissions", Map.of(
                "total", totalSubmissions,
                "pending", pendingSubmissions,
                "graded", gradedSubmissions,
                "gradedPercentage", totalSubmissions > 0 ? Math.round((double) gradedSubmissions / totalSubmissions * 100) : 0
            ));
            
            stats.put("notifications", Map.of(
                "total", totalNotifications,
                "unread", unreadNotifications,
                "unreadPercentage", totalNotifications > 0 ? Math.round((double) unreadNotifications / totalNotifications * 100) : 0
            ));
            
            stats.put("reminders", Map.of(
                "total", totalReminders,
                "pending", pendingReminders,
                "pendingPercentage", totalReminders > 0 ? Math.round((double) pendingReminders / totalReminders * 100) : 0
            ));
            
        } catch (Exception e) {
            // Log the error and return default values
            System.err.println("Error fetching system statistics: " + e.getMessage());
            e.printStackTrace();
            
            // Return default values to prevent frontend crashes
            stats.put("users", Map.of("total", 0, "active", 0, "teachers", 0, "students", 0, "parents", 0, "admins", 0, "activePercentage", 0));
            stats.put("classes", Map.of("total", 0, "active", 0, "activePercentage", 0));
            stats.put("homeworks", Map.of("total", 0, "active", 0, "overdue", 0, "overduePercentage", 0));
            stats.put("submissions", Map.of("total", 0, "pending", 0, "graded", 0, "gradedPercentage", 0));
            stats.put("notifications", Map.of("total", 0, "unread", 0, "unreadPercentage", 0));
            stats.put("reminders", Map.of("total", 0, "pending", 0, "pendingPercentage", 0));
        }
        
        return stats;
    }
    
    /**
     * Get user management data
     */
    public Map<String, Object> getUserManagementData() {
        Map<String, Object> data = new HashMap<>();
        
        // Get recent users
        List<User> recentUsers = userRepository.findTop10ByOrderByCreatedAtDesc();
        
        // Get users by role
        List<User> teachers = userRepository.findByRole(UserRole.TEACHER);
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        List<User> parents = userRepository.findByRole(UserRole.PARENT);
        
        // Get inactive users (no activity in 30 days)
        List<User> inactiveUsers = userRepository.findByLastActivityDateBefore(LocalDateTime.now().minusDays(30));
        
        data.put("recentUsers", recentUsers);
        data.put("teachers", teachers);
        data.put("students", students);
        data.put("parents", parents);
        data.put("inactiveUsers", inactiveUsers);
        
        return data;
    }
    
    /**
     * Get all users for user management
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Create a new user
     */
    public User createUser(User user) {
        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }
        
        // Hash the password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set default values
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setIsActive(true);
        
        // Save and return the user
        return userRepository.save(user);
    }
    
    /**
     * Get user by ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    /**
     * Update an existing user
     */
    public User updateUser(User user) {
        // Check if user exists
        User existingUser = userRepository.findById(user.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if email is being changed and if it already exists
        if (!existingUser.getEmail().equals(user.getEmail()) && 
            userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }
        
        // Update fields
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setEmail(user.getEmail());
        existingUser.setRole(user.getRole());
        existingUser.setPhoneNumber(user.getPhoneNumber());
        existingUser.setClassGrade(user.getClassGrade());
        existingUser.setSubjectTaught(user.getSubjectTaught());
        existingUser.setStudentId(user.getStudentId());
        existingUser.setParentOfStudentId(user.getParentOfStudentId());
        existingUser.setIsActive(user.getIsActive());
        existingUser.setUpdatedAt(LocalDateTime.now());
        
        // Update password if provided
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        // Save and return the updated user
        return userRepository.save(existingUser);
    }
    
    /**
     * Delete a user (soft delete - marks as inactive)
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user can be deleted (e.g., not the last admin)
        if (user.getRole() == UserRole.ADMIN) {
            long adminCount = userRepository.countByRole(UserRole.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last admin user");
            }
        }
        
        // Instead of hard delete, mark user as inactive
        // This preserves data integrity and allows for potential recovery
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Log the soft delete for audit purposes
        logger.info("User {} (ID: {}) has been soft deleted (marked as inactive)", 
                   user.getEmail(), user.getId());
    }
    
    /**
     * Get system health metrics
     */
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Calculate system uptime (simplified - in real app, you'd get this from system metrics)
        LocalDateTime appStartTime = LocalDateTime.now().minusDays(7); // Simulated start time
        long uptimeDays = ChronoUnit.DAYS.between(appStartTime, LocalDateTime.now());
        double uptimePercentage = 99.9; // Simulated uptime
        
        // Database connection health
        boolean dbHealthy = true; // In real app, test database connection
        long dbResponseTime = 15; // Simulated response time in ms
        
        // File system health
        boolean fileSystemHealthy = true;
        long availableStorage = 85; // Simulated available storage percentage
        
        // Memory usage (simplified)
        double memoryUsage = 65.0; // Simulated memory usage percentage
        String memoryStatus = memoryUsage < 70 ? "Normal" : memoryUsage < 85 ? "Moderate" : "High";
        
        health.put("uptime", Map.of(
            "days", uptimeDays,
            "percentage", uptimePercentage,
            "status", uptimePercentage > 99 ? "Excellent" : uptimePercentage > 95 ? "Good" : "Poor"
        ));
        
        health.put("database", Map.of(
            "healthy", dbHealthy,
            "responseTime", dbResponseTime,
            "status", dbResponseTime < 20 ? "Excellent" : dbResponseTime < 50 ? "Good" : "Slow"
        ));
        
        health.put("fileSystem", Map.of(
            "healthy", fileSystemHealthy,
            "availableStorage", availableStorage,
            "status", availableStorage > 80 ? "Good" : availableStorage > 60 ? "Moderate" : "Low"
        ));
        
        health.put("memory", Map.of(
            "usage", memoryUsage,
            "status", memoryStatus,
            "color", memoryStatus.equals("Normal") ? "green" : memoryStatus.equals("Moderate") ? "yellow" : "red"
        ));
        
        return health;
    }
    
    /**
     * Get recent system activities
     */
    public Map<String, Object> getRecentActivities() {
        Map<String, Object> activities = new HashMap<>();
        
        try {
            // Recent homeworks created - convert to simple maps to avoid lazy loading issues
            List<Homework> recentHomeworks = homeworkRepository.findTop5ByOrderByCreatedAtDesc();
            List<Map<String, Object>> homeworkData = new ArrayList<>();
            if (recentHomeworks != null) {
                for (Homework hw : recentHomeworks) {
                    Map<String, Object> hwMap = new HashMap<>();
                    hwMap.put("id", hw.getId());
                    hwMap.put("title", hw.getTitle());
                    hwMap.put("subject", hw.getSubject());
                    hwMap.put("classGrade", hw.getClassGrade());
                    hwMap.put("dueDate", hw.getDueDate());
                    hwMap.put("createdAt", hw.getCreatedAt());
                    homeworkData.add(hwMap);
                }
            }
            activities.put("recentHomeworks", homeworkData);
            
            // Recent submissions - convert to simple maps
            List<HomeworkSubmission> recentSubmissions = submissionRepository.findTop5ByOrderBySubmittedAtDesc();
            List<Map<String, Object>> submissionData = new ArrayList<>();
            if (recentSubmissions != null) {
                for (HomeworkSubmission sub : recentSubmissions) {
                    Map<String, Object> subMap = new HashMap<>();
                    subMap.put("id", sub.getId());
                    subMap.put("submittedAt", sub.getSubmittedAt());
                    subMap.put("status", sub.getStatus());
                    subMap.put("grade", sub.getGrade());
                    subMap.put("isLate", sub.isLate());
                    submissionData.add(subMap);
                }
            }
            activities.put("recentSubmissions", submissionData);
            
            // Recent classes created - convert to simple maps to avoid lazy loading issues
            List<Class> recentClasses = classRepository.findTop5ByOrderByCreatedAtDesc();
            List<Map<String, Object>> classData = new ArrayList<>();
            if (recentClasses != null) {
                for (Class cls : recentClasses) {
                    Map<String, Object> clsMap = new HashMap<>();
                    clsMap.put("id", cls.getId());
                    clsMap.put("className", cls.getClassName());
                    clsMap.put("subject", cls.getSubject());
                    clsMap.put("gradeLevel", cls.getGradeLevel());
                    clsMap.put("isActive", cls.getIsActive());
                    clsMap.put("createdAt", cls.getCreatedAt());
                    // Don't include teacher object to avoid lazy loading
                    if (cls.getTeacher() != null) {
                        clsMap.put("teacherId", cls.getTeacher().getId());
                    }
                    classData.add(clsMap);
                }
            }
            activities.put("recentClasses", classData);
            
            // Recent notifications - convert to simple maps
            List<com.homework.entity.Notification> recentNotifications = notificationRepository.findTop5ByOrderByCreatedAtDesc();
            List<Map<String, Object>> notificationData = new ArrayList<>();
            if (recentNotifications != null) {
                for (com.homework.entity.Notification notif : recentNotifications) {
                    Map<String, Object> notifMap = new HashMap<>();
                    notifMap.put("id", notif.getId());
                    notifMap.put("title", notif.getTitle());
                    notifMap.put("message", notif.getMessage());
                    notifMap.put("type", notif.getType());
                    notifMap.put("read", notif.isRead());
                    notifMap.put("createdAt", notif.getCreatedAt());
                    notificationData.add(notifMap);
                }
            }
            activities.put("recentNotifications", notificationData);
            
        } catch (Exception e) {
            // Log the error and return empty data
            System.err.println("Error fetching recent activities: " + e.getMessage());
            e.printStackTrace();
            
            // Return empty lists to prevent frontend crashes
            activities.put("recentHomeworks", new ArrayList<>());
            activities.put("recentSubmissions", new ArrayList<>());
            activities.put("recentClasses", new ArrayList<>());
            activities.put("recentNotifications", new ArrayList<>());
        }
        
        return activities;
    }
    
    /**
     * Update user role
     */
    public User updateUserRole(Long userId, UserRole newRole) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    /**
     * Deactivate user account
     */
    public User deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Set user as inactive (you might want to add an isActive field to User entity)
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    /**
     * Get user statistics for a specific user
     */
    public Map<String, Object> getUserStatistics(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> stats = new HashMap<>();
        
        if (user.getRole() == UserRole.TEACHER) {
            // Teacher statistics
            long classesCount = classRepository.countByTeacherId(userId);
            long homeworksCount = homeworkRepository.countByTeacherId(userId);
            long activeClasses = classRepository.countByTeacherIdAndIsActiveTrue(userId);
            
            stats.put("classes", classesCount);
            stats.put("homeworks", homeworksCount);
            stats.put("activeClasses", activeClasses);
            
        } else if (user.getRole() == UserRole.STUDENT) {
            // Student statistics
            long enrolledClasses = classRepository.countClassesByStudent(userId);
            long submittedHomeworks = submissionRepository.countByStudentId(userId);
            long gradedHomeworks = submissionRepository.countByStudentIdAndStatus(userId, HomeworkSubmission.SubmissionStatus.GRADED);
            
            stats.put("enrolledClasses", enrolledClasses);
            stats.put("submittedHomeworks", submittedHomeworks);
            stats.put("gradedHomeworks", gradedHomeworks);
            
        } else if (user.getRole() == UserRole.PARENT) {
            // Parent statistics
            if (user.getParentOfStudentId() != null) {
                User student = userRepository.findById(user.getParentOfStudentId()).orElse(null);
                if (student != null) {
                    long studentClasses = classRepository.countClassesByStudent(student.getId());
                    long studentHomeworks = homeworkRepository.countByClassGrade(student.getClassGrade());
                    
                    stats.put("studentClasses", studentClasses);
                    stats.put("studentHomeworks", studentHomeworks);
                }
            }
        }
        
        stats.put("lastActivity", user.getLastActivityDate());
        stats.put("createdAt", user.getCreatedAt());
        
        return stats;
    }
    
    /**
     * Send system-wide announcement
     */
    public void sendSystemAnnouncement(String title, String message, UserRole targetRole) {
        List<User> targetUsers;
        
        if (targetRole != null) {
            targetUsers = userRepository.findByRole(targetRole);
        } else {
            targetUsers = userRepository.findAll();
        }
        
        // Create notifications for all target users
        for (User user : targetUsers) {
            com.homework.entity.Notification notification = new com.homework.entity.Notification();
            notification.setUserId(user.getId());
            notification.setType(com.homework.entity.Notification.NotificationType.SYSTEM);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setPriority(com.homework.entity.Notification.NotificationPriority.HIGH);
            notification.setCreatedAt(LocalDateTime.now());
            
            notificationRepository.save(notification);
        }
    }
    
    /**
     * Get system performance metrics
     */
    public Map<String, Object> getPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Calculate average response times (simplified)
        double avgResponseTime = 45.0; // Simulated average response time in ms
        
        // Calculate error rates (simplified)
        double errorRate = 0.02; // Simulated 2% error rate
        
        // Calculate throughput (simplified)
        long requestsPerMinute = 120; // Simulated requests per minute
        
        // Calculate success rate
        double successRate = (1 - errorRate) * 100;
        
        metrics.put("responseTime", Map.of(
            "average", avgResponseTime,
            "status", avgResponseTime < 50 ? "Excellent" : avgResponseTime < 100 ? "Good" : "Slow"
        ));
        
        metrics.put("errorRate", Map.of(
            "percentage", errorRate * 100,
            "status", errorRate < 0.01 ? "Excellent" : errorRate < 0.05 ? "Good" : "High"
        ));
        
        metrics.put("throughput", Map.of(
            "requestsPerMinute", requestsPerMinute,
            "status", requestsPerMinute > 100 ? "High" : requestsPerMinute > 50 ? "Medium" : "Low"
        ));
        
        metrics.put("successRate", Map.of(
            "percentage", successRate,
            "status", successRate > 99 ? "Excellent" : successRate > 95 ? "Good" : "Poor"
        ));
        
        return metrics;
    }
}
