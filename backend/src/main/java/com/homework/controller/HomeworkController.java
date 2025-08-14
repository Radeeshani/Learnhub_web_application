package com.homework.controller;

import com.homework.dto.HomeworkRequest;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.service.HomeworkService;
import com.homework.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/homework")
public class HomeworkController {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeworkController.class);
    
    @Autowired
    private HomeworkService homeworkService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<?> createHomework(
            @RequestParam("file") MultipartFile file,
            @Valid @RequestPart("homework") HomeworkRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String teacherEmail = authHeader.substring(7); // Remove "Bearer " prefix
            logger.debug("Creating homework for teacher: {}", teacherEmail);
            
            Homework homework = homeworkService.createHomework(request, file, teacherEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Homework created successfully");
            response.put("id", homework.getId());
            
            logger.debug("Homework created successfully with ID: {}", homework.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to create homework", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherHomework(@RequestHeader("Authorization") String authHeader) {
        try {
            String teacherEmail = authHeader.substring(7);
            logger.debug("Fetching homework for teacher: {}", teacherEmail);
            
            List<Homework> homeworks = homeworkService.getTeacherHomework(teacherEmail);
            logger.debug("Found {} homework assignments", homeworks.size());
            
            return ResponseEntity.ok(homeworks);
        } catch (Exception e) {
            logger.error("Failed to fetch teacher homework", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/student")
    public ResponseEntity<?> getStudentHomework(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder) {
        try {
            String studentEmail = authHeader.substring(7);
            User user = userService.getUserByEmail(studentEmail);
            
            if (user.getParentOfStudentId() != null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid endpoint for parent users"));
            }
            
            logger.debug("Fetching homework for student: {}", studentEmail);
            List<Homework> homeworks = homeworkService.getStudentHomework(studentEmail, subject, sortBy, sortOrder);
            logger.debug("Found {} homework assignments for student", homeworks.size());
            
            return ResponseEntity.ok(homeworks);
        } catch (Exception e) {
            logger.error("Failed to fetch student homework", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/parent")
    public ResponseEntity<?> getParentHomework(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder) {
        try {
            String parentEmail = authHeader.substring(7);
            User parent = userService.getUserByEmail(parentEmail);
            
            if (parent.getParentOfStudentId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid endpoint for student users"));
            }
            
            logger.debug("Fetching homework for parent: {}", parentEmail);
            List<Homework> homeworks = homeworkService.getParentHomework(parentEmail, subject, sortBy, sortOrder);
            logger.debug("Found {} homework assignments for parent's children", homeworks.size());
            
            return ResponseEntity.ok(homeworks);
        } catch (Exception e) {
            logger.error("Failed to fetch parent homework", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/grade/{classGrade}")
    public ResponseEntity<?> getHomeworkByGrade(@PathVariable String classGrade) {
        try {
            logger.debug("Fetching homework for grade: {}", classGrade);
            
            List<Homework> homeworks = homeworkService.getHomeworkByGrade(classGrade);
            logger.debug("Found {} homework assignments for grade {}", homeworks.size(), classGrade);
            
            return ResponseEntity.ok(homeworks);
        } catch (Exception e) {
            logger.error("Failed to fetch homework by grade", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getHomework(@PathVariable Long id) {
        try {
            logger.debug("Fetching homework with ID: {}", id);
            
            Homework homework = homeworkService.getHomework(id);
            logger.debug("Found homework: {}", homework != null);
            
            return ResponseEntity.ok(homework);
        } catch (Exception e) {
            logger.error("Failed to fetch homework by ID", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateHomework(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile file,
            @Valid @RequestPart("homework") HomeworkRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String teacherEmail = authHeader.substring(7);
            logger.debug("Updating homework {} for teacher: {}", id, teacherEmail);
            
            Homework homework = homeworkService.updateHomework(id, request, file, teacherEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Homework updated successfully");
            response.put("id", homework.getId());
            
            logger.debug("Homework updated successfully with ID: {}", homework.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to update homework", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHomework(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String teacherEmail = authHeader.substring(7);
            logger.debug("Deleting homework {} for teacher: {}", id, teacherEmail);
            
            homeworkService.deleteHomework(id, teacherEmail);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Homework deleted successfully");
            
            logger.debug("Homework deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to delete homework", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 