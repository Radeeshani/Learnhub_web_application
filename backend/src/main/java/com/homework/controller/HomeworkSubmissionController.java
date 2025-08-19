package com.homework.controller;

import com.homework.dto.HomeworkSubmissionRequest;
import com.homework.dto.HomeworkSubmissionResponse;
import com.homework.service.HomeworkSubmissionService;
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
@RequestMapping("/api/submissions")
public class HomeworkSubmissionController {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeworkSubmissionController.class);
    
    // @Autowired
    // private HomeworkSubmissionService submissionService;
    
    @GetMapping("/test")
    public String test() {
        return "HomeworkSubmissionController is working!";
    }
    
    /*
    @PostMapping
    public ResponseEntity<?> submitHomework(
            @RequestPart("submission") HomeworkSubmissionRequest request,
            @RequestPart(value = "voiceFile", required = false) MultipartFile voiceFile,
            @RequestPart(value = "photoFile", required = false) MultipartFile photoFile,
            @RequestPart(value = "pdfFile", required = false) MultipartFile pdfFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String studentEmail = authHeader.substring(7); // Remove "Bearer " prefix
            logger.debug("Processing homework submission for student: {}", studentEmail);
            
            // Handle file uploads if present
            if (voiceFile != null && !voiceFile.isEmpty()) {
                // TODO: Implement voice file upload service
                request.setVoiceRecordingUrl("voice_uploaded_" + System.currentTimeMillis() + ".wav");
            }
            
            if (photoFile != null && !photoFile.isEmpty()) {
                // TODO: Implement photo file upload service
                request.setPdfUrl("photo_uploaded_" + System.currentTimeMillis() + ".jpg");
            }
            
            if (pdfFile != null && !pdfFile.isEmpty()) {
                // TODO: Implement PDF file upload service
                request.setPdfUrl("pdf_uploaded_" + System.currentTimeMillis() + ".pdf");
            }
            
            HomeworkSubmissionResponse response = submissionService.submitHomework(request, studentEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Homework submitted successfully");
            result.put("submission", response);
            
            logger.debug("Homework submitted successfully with ID: {}", response.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Failed to submit homework", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to submit homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/homework/{homeworkId}")
    public ResponseEntity<?> getHomeworkSubmissions(@PathVariable Long homeworkId) {
        try {
            List<HomeworkSubmissionResponse> submissions = submissionService.getHomeworkSubmissions(homeworkId);
            logger.debug("Found {} submissions for homework ID: {}", submissions.size(), homeworkId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Failed to fetch homework submissions", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch submissions: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/student")
    public ResponseEntity<?> getStudentSubmissions(@RequestHeader("Authorization") String authHeader) {
        try {
            String studentEmail = authHeader.substring(7);
            List<HomeworkSubmissionResponse> submissions = submissionService.getStudentSubmissions(studentEmail);
            logger.debug("Found {} submissions for student: {}", submissions.size(), studentEmail);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Failed to fetch student submissions", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch submissions: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> gradeRequest,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String teacherEmail = authHeader.substring(7);
            Integer grade = (Integer) gradeRequest.get("grade");
            String feedback = (String) gradeRequest.get("feedback");
            
            if (grade == null || grade < 0 || grade > 100) {
                return ResponseEntity.badRequest().body(Map.of("message", "Grade must be between 0 and 100"));
            }
            
            HomeworkSubmissionResponse response = submissionService.gradeSubmission(submissionId, grade, feedback, teacherEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Submission graded successfully");
            result.put("submission", response);
            
            logger.debug("Submission graded successfully with ID: {}", response.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Failed to grade submission", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to grade submission: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{submissionId}")
    public ResponseEntity<?> getSubmission(@PathVariable Long submissionId) {
        try {
            HomeworkSubmissionResponse submission = submissionService.getSubmission(submissionId);
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            logger.error("Failed to fetch submission", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch submission: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/homework/{homeworkId}/stats")
    public ResponseEntity<?> getHomeworkStats(@PathVariable Long homeworkId) {
        try {
            long totalSubmissions = submissionService.getSubmissionCount(homeworkId);
            long gradedSubmissions = submissionService.getGradedCount(homeworkId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalSubmissions", totalSubmissions);
            stats.put("gradedSubmissions", gradedSubmissions);
            stats.put("pendingSubmissions", totalSubmissions - gradedSubmissions);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Failed to fetch homework stats", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    */
}
