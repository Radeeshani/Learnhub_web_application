package com.homework.controller;

import com.homework.dto.ReportRequest;
import com.homework.dto.ReportResponse;
import com.homework.service.ReportService;
import com.homework.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    /**
     * Create a new student report (Teacher only)
     */
    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody ReportRequest request,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            ReportResponse report = reportService.createReport(request, teacherEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Report created successfully");
            response.put("report", report);
            
            logger.info("Report created successfully for student {} by teacher {}", 
                       request.getStudentId(), teacherEmail);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error creating report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create report: " + e.getMessage()));
        }
    }
    
    /**
     * Get reports by teacher (Teacher only)
     */
    @GetMapping("/teacher")
    public ResponseEntity<?> getReportsByTeacher(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            List<ReportResponse> reports = reportService.getReportsByTeacher(teacherEmail);
            
            return ResponseEntity.ok(reports);
            
        } catch (Exception e) {
            logger.error("Error fetching reports by teacher: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch reports: " + e.getMessage()));
        }
    }
    
    /**
     * Get reports by teacher and class (Teacher only)
     */
    @GetMapping("/teacher/class/{classId}")
    public ResponseEntity<?> getReportsByTeacherAndClass(@PathVariable Long classId,
                                                        @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            List<ReportResponse> reports = reportService.getReportsByTeacherAndClass(teacherEmail, classId);
            
            return ResponseEntity.ok(reports);
            
        } catch (Exception e) {
            logger.error("Error fetching reports by teacher and class: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch reports: " + e.getMessage()));
        }
    }
    
    /**
     * Get reports by student (Student only)
     */
    @GetMapping("/student")
    public ResponseEntity<?> getReportsByStudent(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String studentEmail = jwtTokenProvider.getEmailFromToken(token);
            List<ReportResponse> reports = reportService.getReportsByStudent(studentEmail);
            
            return ResponseEntity.ok(reports);
            
        } catch (Exception e) {
            logger.error("Error fetching reports by student: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch reports: " + e.getMessage()));
        }
    }
    
    /**
     * Get report by ID (Teacher or Student with access)
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<?> getReportById(@PathVariable Long reportId,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String userEmail = jwtTokenProvider.getEmailFromToken(token);
            ReportResponse report = reportService.getReportById(reportId, userEmail);
            
            return ResponseEntity.ok(report);
            
        } catch (Exception e) {
            logger.error("Error fetching report by ID: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch report: " + e.getMessage()));
        }
    }
    
    /**
     * Update report (Teacher only)
     */
    @PutMapping("/{reportId}")
    public ResponseEntity<?> updateReport(@PathVariable Long reportId,
                                        @RequestBody ReportRequest request,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            ReportResponse report = reportService.updateReport(reportId, request, teacherEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Report updated successfully");
            response.put("report", report);
            
            logger.info("Report {} updated successfully by teacher {}", reportId, teacherEmail);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error updating report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update report: " + e.getMessage()));
        }
    }
    
    /**
     * Delete report (Teacher only)
     */
    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            reportService.deleteReport(reportId, teacherEmail);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Report deleted successfully");
            
            logger.info("Report {} deleted successfully by teacher {}", reportId, teacherEmail);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error deleting report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete report: " + e.getMessage()));
        }
    }
    
    /**
     * Get students for a specific class (Teacher only - for their assigned classes)
     */
    @GetMapping("/class/{classId}/students")
    public ResponseEntity<?> getStudentsForClass(@PathVariable Long classId,
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            List<Map<String, Object>> students = reportService.getStudentsForClass(classId, teacherEmail);
            
            return ResponseEntity.ok(students);
            
        } catch (Exception e) {
            logger.error("Error fetching students for class: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch students: " + e.getMessage()));
        }
    }
    
    /**
     * Download report as PDF (Student only - their own reports)
     */
    @GetMapping("/{reportId}/download")
    public ResponseEntity<?> downloadReportAsPdf(@PathVariable Long reportId,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String studentEmail = jwtTokenProvider.getEmailFromToken(token);
            byte[] pdfContent = reportService.generatePdfReport(reportId, studentEmail);
            
            return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"student_report_" + reportId + ".pdf\"")
                .body(pdfContent);
            
        } catch (Exception e) {
            logger.error("Error downloading report as PDF: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to download report: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ReportController is working!");
    }
}
