package com.homework.controller;

import com.homework.dto.HomeworkRequest;
import com.homework.entity.Homework;
import com.homework.service.HomeworkService;
import jakarta.validation.Valid;
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
    
    @Autowired
    private HomeworkService homeworkService;
    
    @PostMapping
    public ResponseEntity<?> createHomework(
            @RequestParam("file") MultipartFile file,
            @Valid @RequestPart("homework") HomeworkRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String teacherEmail = authHeader.substring(7); // Remove "Bearer " prefix
            Homework homework = homeworkService.createHomework(request, file, teacherEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Homework created successfully");
            response.put("id", homework.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherHomework(@RequestHeader("Authorization") String authHeader) {
        try {
            String teacherEmail = authHeader.substring(7);
            List<Homework> homeworks = homeworkService.getTeacherHomework(teacherEmail);
            return ResponseEntity.ok(homeworks);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/grade/{classGrade}")
    public ResponseEntity<?> getHomeworkByGrade(@PathVariable String classGrade) {
        try {
            List<Homework> homeworks = homeworkService.getHomeworkByGrade(classGrade);
            return ResponseEntity.ok(homeworks);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getHomework(@PathVariable Long id) {
        try {
            Homework homework = homeworkService.getHomework(id);
            return ResponseEntity.ok(homework);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 