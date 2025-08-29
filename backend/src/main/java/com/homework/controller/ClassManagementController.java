package com.homework.controller;

import com.homework.entity.Class;
import com.homework.entity.Enrollment;
import com.homework.entity.User;
import com.homework.enums.UserRole;
import com.homework.repository.UserRepository;
import com.homework.service.ClassManagementService;
import com.homework.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/classes")
public class ClassManagementController {

    private static final Logger logger = LoggerFactory.getLogger(ClassManagementController.class);

    @Autowired
    private ClassManagementService classManagementService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all classes with detailed information
     */
    @GetMapping
    public ResponseEntity<?> getAllClasses(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            var classes = classManagementService.getAllClassesWithDetails();
            return ResponseEntity.ok(classes);

        } catch (Exception e) {
            logger.error("Error getting all classes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get classes"));
        }
    }

    /**
     * Get class by ID with detailed information
     */
    @GetMapping("/{classId}")
    public ResponseEntity<?> getClassById(@PathVariable Long classId, @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            var classInfo = classManagementService.getClassWithDetails(classId);
            return ResponseEntity.ok(classInfo);

        } catch (Exception e) {
            logger.error("Error getting class by ID", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get class"));
        }
    }

    /**
     * Create a new class
     */
    @PostMapping
    public ResponseEntity<?> createClass(@RequestBody Class classData, @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            Map<String, Object> newClass = classManagementService.createClass(classData);
            return ResponseEntity.status(HttpStatus.CREATED).body(newClass);

        } catch (Exception e) {
            logger.error("Error creating class", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create class: " + e.getMessage()));
        }
    }

    /**
     * Update an existing class
     */
    @PutMapping("/{classId}")
    public ResponseEntity<?> updateClass(@PathVariable Long classId, @RequestBody Class classData, 
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            Map<String, Object> updatedClass = classManagementService.updateClass(classId, classData);
            return ResponseEntity.ok(updatedClass);

        } catch (Exception e) {
            logger.error("Error updating class", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update class: " + e.getMessage()));
        }
    }

    /**
     * Assign teacher to class
     */
    @PutMapping("/{classId}/teacher/{teacherId}")
    public ResponseEntity<?> assignTeacherToClass(@PathVariable Long classId, @PathVariable Long teacherId,
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            logger.info("Attempting to assign teacher {} to class {}", teacherId, classId);
            
            Map<String, Object> updatedClass = classManagementService.assignTeacherToClass(classId, teacherId);
            
            logger.info("Successfully assigned teacher {} to class {}", teacherId, classId);
            return ResponseEntity.ok(updatedClass);

        } catch (Exception e) {
            logger.error("Error assigning teacher {} to class {}: {}", teacherId, classId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to assign teacher: " + e.getMessage()));
        }
    }

    /**
     * Remove teacher from class
     */
    @DeleteMapping("/{classId}/teacher")
    public ResponseEntity<?> removeTeacherFromClass(@PathVariable Long classId,
                                                  @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            logger.info("Attempting to remove teacher from class {}", classId);
            
            Map<String, Object> updatedClass = classManagementService.removeTeacherFromClass(classId);
            
            logger.info("Successfully removed teacher from class {}", classId);
            return ResponseEntity.ok(updatedClass);

        } catch (Exception e) {
            logger.error("Error removing teacher from class {}: {}", classId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to remove teacher: " + e.getMessage()));
        }
    }

    /**
     * Enroll student in class
     */
    @PostMapping("/{classId}/enroll/{studentId}")
    public ResponseEntity<?> enrollStudentInClass(@PathVariable Long classId, @PathVariable Long studentId,
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            Enrollment enrollment = classManagementService.enrollStudentInClass(classId, studentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);

        } catch (Exception e) {
            logger.error("Error enrolling student in class", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to enroll student: " + e.getMessage()));
        }
    }

    /**
     * Enroll multiple students in class
     */
    @PostMapping("/{classId}/enroll/multiple")
    public ResponseEntity<?> enrollMultipleStudentsInClass(@PathVariable Long classId, 
                                                         @RequestBody List<Long> studentIds,
                                                         @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            List<Enrollment> enrollments = classManagementService.enrollMultipleStudentsInClass(classId, studentIds);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Successfully enrolled " + enrollments.size() + " students",
                "enrollmentCount", enrollments.size()
            ));

        } catch (Exception e) {
            logger.error("Error enrolling multiple students in class", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to enroll students: " + e.getMessage()));
        }
    }

    /**
     * Remove student from class
     */
    @DeleteMapping("/{classId}/enroll/{studentId}")
    public ResponseEntity<?> removeStudentFromClass(@PathVariable Long classId, @PathVariable Long studentId,
                                                  @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            classManagementService.removeStudentFromClass(classId, studentId);
            return ResponseEntity.ok(Map.of("message", "Student removed from class successfully"));

        } catch (Exception e) {
            logger.error("Error removing student from class", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to remove student: " + e.getMessage()));
        }
    }

    /**
     * Get classes by grade level
     */
    @GetMapping("/grade/{gradeLevel}")
    public ResponseEntity<?> getClassesByGradeLevel(@PathVariable String gradeLevel, 
                                                  @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            var classes = classManagementService.getClassesByGradeLevel(gradeLevel);
            return ResponseEntity.ok(classes);

        } catch (Exception e) {
            logger.error("Error getting classes by grade level", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get classes"));
        }
    }

    /**
     * Get available teachers for assignment
     */
    @GetMapping("/teachers/available")
    public ResponseEntity<?> getAvailableTeachers(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            var teachers = classManagementService.getAvailableTeachers();
            return ResponseEntity.ok(teachers);

        } catch (Exception e) {
            logger.error("Error getting available teachers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get teachers"));
        }
    }

    /**
     * Get available students for enrollment by grade level
     */
    @GetMapping("/students/available/{gradeLevel}")
    public ResponseEntity<?> getAvailableStudents(@PathVariable String gradeLevel, 
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            var students = classManagementService.getAvailableStudents(gradeLevel);
            return ResponseEntity.ok(students);

        } catch (Exception e) {
            logger.error("Error getting available students", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get students"));
        }
    }

    /**
     * Get all available students for enrollment
     */
    @GetMapping("/students/available")
    public ResponseEntity<?> getAllAvailableStudents(@RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            var students = classManagementService.getAllAvailableStudents();
            return ResponseEntity.ok(students);

        } catch (Exception e) {
            logger.error("Error getting all available students", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get students"));
        }
    }

    /**
     * Get enrolled students for a specific class
     */
    @GetMapping("/{classId}/enrolled-students")
    public ResponseEntity<?> getEnrolledStudentsForClass(@PathVariable Long classId, 
                                                       @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            var students = classManagementService.getEnrolledStudentsForClass(classId);
            return ResponseEntity.ok(students);

        } catch (Exception e) {
            logger.error("Error getting enrolled students for class {}", classId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get enrolled students"));
        }
    }

    /**
     * Deactivate class
     */
    @PutMapping("/{classId}/deactivate")
    public ResponseEntity<?> deactivateClass(@PathVariable Long classId, @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            Class deactivatedClass = classManagementService.deactivateClass(classId);
            return ResponseEntity.ok(deactivatedClass);

        } catch (Exception e) {
            logger.error("Error deactivating class", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to deactivate class"));
        }
    }

    /**
     * Activate class
     */
    @PutMapping("/{classId}/activate")
    public ResponseEntity<?> activateClass(@PathVariable Long classId, @RequestHeader("Authorization") String authHeader) {
        try {
            if (!validateAdminToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }

            Class activatedClass = classManagementService.activateClass(classId);
            return ResponseEntity.ok(activatedClass);

        } catch (Exception e) {
            logger.error("Error activating class", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to activate class"));
        }
    }

    /**
     * Debug endpoint to test teacher assignment logic
     */
    @GetMapping("/debug/teacher-assignment/{classId}/{teacherId}")
    public ResponseEntity<?> debugTeacherAssignment(@PathVariable Long classId, @PathVariable Long teacherId) {
        try {
            logger.info("Debug: Testing teacher assignment for class {} and teacher {}", classId, teacherId);
            
            // Check if class exists
            var classEntity = classManagementService.getClassWithDetails(classId);
            if (classEntity == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Class not found with ID: " + classId));
            }
            
            // Check if teacher exists
            var teacher = userRepository.findById(teacherId);
            if (teacher.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Teacher not found with ID: " + teacherId));
            }
            
            // Check teacher role
            if (teacher.get().getRole() != UserRole.TEACHER) {
                return ResponseEntity.badRequest().body(Map.of("error", "User is not a teacher. Role: " + teacher.get().getRole()));
            }
            
            return ResponseEntity.ok(Map.of(
                "class", Map.of("id", classEntity.get("id"), "name", classEntity.get("className")),
                "teacher", Map.of("id", teacher.get().getId(), "name", teacher.get().getFirstName() + " " + teacher.get().getLastName(), "role", teacher.get().getRole()),
                "message", "Both class and teacher are valid"
            ));
            
        } catch (Exception e) {
            logger.error("Debug error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Debug error: " + e.getMessage()));
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
}
