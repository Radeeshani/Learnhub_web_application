package com.homework.controller;

import com.homework.dto.CalendarEventRequest;
import com.homework.dto.ClassRequest;
import com.homework.dto.ClassResponse;
import com.homework.entity.CalendarEvent;
import com.homework.entity.Homework;
import com.homework.service.CalendarService;
import com.homework.service.ClassService;
import com.homework.service.HomeworkService;
import com.homework.dto.HomeworkRequest;
import com.homework.dto.HomeworkResponse;
import com.homework.dto.StudentHomeworkResponse;
import com.homework.dto.HomeworkSubmissionRequest;
import com.homework.dto.HomeworkSubmissionResponse;
import com.homework.entity.User;
import com.homework.enums.UserRole;
import com.homework.service.HomeworkSubmissionService;
import com.homework.service.UserService;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/homework")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class HomeworkController {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeworkController.class);
    
    @Autowired
    private HomeworkService homeworkService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private HomeworkSubmissionService submissionService;


    
    @Autowired
    private CalendarService calendarService;
    
    @Autowired
    private ClassService classService;
    
    @Autowired
    private com.homework.security.JwtTokenProvider jwtTokenProvider;
    
    // Calendar endpoints
    @GetMapping("/calendar/test")
    public ResponseEntity<String> calendarTest() {
        return ResponseEntity.ok("Calendar endpoints are working from HomeworkController!");
    }

    @GetMapping("/calendar/events")
    public ResponseEntity<?> getCalendarEvents(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            List<CalendarEvent> events = calendarService.getUpcomingEvents(userId, 30);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving calendar events: " + e.getMessage());
        }
    }

    @PostMapping("/calendar/events")
    public ResponseEntity<?> createCalendarEvent(@RequestBody CalendarEventRequest request, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            // Log the request for debugging
            logger.info("Creating calendar event for user {}: {}", userId, request);
            
            // Convert request to entity and create event
            CalendarEvent event = new CalendarEvent();
            event.setTitle(request.getTitle());
            event.setDescription(request.getDescription());
            event.setStartTime(request.getStartTime());
            event.setEndTime(request.getEndTime());
            event.setAllDay(request.isAllDay());
            event.setEventType(request.getEventTypeEnum());
            event.setUserId(userId);
            event.setHomeworkId(request.getHomeworkId());
            event.setClassId(request.getClassId());
            event.setColor(request.getColor() != null ? request.getColor() : "#3B82F6");
            event.setLocation(request.getLocation());
            event.setRecurring(request.isRecurring());
            event.setRecurrencePattern(request.getRecurrencePattern());
            
            CalendarEvent savedEvent = calendarService.createEvent(event);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            logger.error("Error creating calendar event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error creating calendar event: " + e.getMessage());
        }
    }

    // Get calendar events with different views
    @GetMapping("/calendar/events/view")
    public ResponseEntity<?> getCalendarEventsByView(
            @RequestParam(required = false) String view,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            List<CalendarEvent> events;
            
            if ("today".equals(view)) {
                events = calendarService.getTodayEvents(userId);
            } else if ("week".equals(view)) {
                events = calendarService.getWeekEvents(userId);
            } else if ("month".equals(view)) {
                events = calendarService.getMonthEvents(userId);
            } else if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDateTime.parse(startDate);
                LocalDateTime end = LocalDateTime.parse(endDate);
                events = calendarService.getUserEventsInRange(userId, start, end);
            } else {
                // Default to upcoming events (next 30 days)
                events = calendarService.getUpcomingEvents(userId, 30);
            }
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving calendar events: " + e.getMessage());
        }
    }

    // Search calendar events
    @GetMapping("/calendar/search")
    public ResponseEntity<?> searchCalendarEvents(@RequestParam String query, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            List<CalendarEvent> events = calendarService.searchEvents(userId, query);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching calendar events: " + e.getMessage());
        }
    }

    // Update calendar event
    @PutMapping("/calendar/events/{eventId}")
    public ResponseEntity<?> updateCalendarEvent(
            @PathVariable Long eventId,
            @RequestBody CalendarEventRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            // Check if user can edit this event (only teachers and admins can edit events)
            User currentUser = userService.getUserById(userId);
            if (currentUser == null || (currentUser.getRole() != UserRole.TEACHER && currentUser.getRole() != UserRole.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only teachers and admins can edit calendar events");
            }
            
            // Get the existing event
            CalendarEvent existingEvent = calendarService.getEventById(eventId);
            
            // Update the event with new details
            CalendarEvent updatedEvent = new CalendarEvent();
            updatedEvent.setTitle(request.getTitle());
            updatedEvent.setDescription(request.getDescription());
            updatedEvent.setStartTime(request.getStartTime());
            updatedEvent.setEndTime(request.getEndTime());
            updatedEvent.setAllDay(request.isAllDay());
            updatedEvent.setEventType(request.getEventTypeEnum());
            updatedEvent.setColor(request.getColor() != null ? request.getColor() : "#3B82F6");
            updatedEvent.setLocation(request.getLocation());
            updatedEvent.setRecurring(request.isRecurring());
            updatedEvent.setRecurrencePattern(request.getRecurrencePattern());
            
            CalendarEvent savedEvent = calendarService.updateEvent(eventId, updatedEvent);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            logger.error("Error updating calendar event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error updating calendar event: " + e.getMessage());
        }
    }

    // Delete calendar event
    @DeleteMapping("/calendar/events/{eventId}")
    public ResponseEntity<?> deleteCalendarEvent(
            @PathVariable Long eventId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            // Check if user can delete this event (only teachers and admins can delete events)
            User currentUser = userService.getUserById(userId);
            if (currentUser == null || (currentUser.getRole() != UserRole.TEACHER && currentUser.getRole() != UserRole.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only teachers and admins can delete calendar events");
            }
            
            // Delete the event
            calendarService.deleteEvent(eventId);
            return ResponseEntity.ok("Calendar event deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting calendar event: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error deleting calendar event: " + e.getMessage());
        }
    }

    // Get calendar summary
    @GetMapping("/calendar/summary")
    public ResponseEntity<?> getCalendarSummary(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            java.util.Map<CalendarEvent.EventType, Long> summary = calendarService.getCalendarSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting calendar summary: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createHomework(
            @RequestParam(value = "title", required = true) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "subject", required = true) String subject,
            @RequestParam(value = "grade", required = true) Integer grade,
            @RequestParam(value = "classGrade", required = true) String classGrade,
            @RequestParam(value = "classId", required = true) Long classId,
            @RequestParam(value = "dueDate", required = true) String dueDate,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("🚀 HOMEWORK CREATION REQUEST RECEIVED");
            logger.info("📝 Homework details - Title: '{}', Subject: '{}', Grade: {}, Class: {}", title, subject, grade, classGrade);
            logger.info("📅 Due date: {}", dueDate);
            logger.info("📎 File attached: {}", file != null ? file.getOriginalFilename() : "None");
            logger.info("🎵 Audio file attached: {}", audioFile != null ? audioFile.getOriginalFilename() : "None");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("❌ Invalid authorization header");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Import and use JwtTokenProvider to extract email
            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            
            // Debug: Log the token and extracted email
            logger.info("🔑 Auth header received: {}", authHeader.substring(0, Math.min(20, authHeader.length())) + "...");
            logger.info("🔑 Token extracted successfully: {}", token.substring(0, Math.min(20, token.length())) + "...");
            logger.info("👤 Extracted teacher email: {}", teacherEmail);
            
            if (teacherEmail == null) {
                logger.error("❌ Failed to extract email from token");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid token: Could not extract email");
                return ResponseEntity.status(401).body(error);
            }
            
            logger.info("✅ Teacher authentication successful: {}", teacherEmail);
            logger.info("📚 Creating homework for teacher: {}", teacherEmail);
            
            // Create HomeworkRequest from individual parameters
            HomeworkRequest homeworkRequest = new HomeworkRequest();
            homeworkRequest.setTitle(title);
            homeworkRequest.setDescription(description);
            homeworkRequest.setSubject(subject);
            homeworkRequest.setGrade(grade);
            homeworkRequest.setClassGrade(classGrade);
            homeworkRequest.setClassId(classId);
            
            // Parse the ISO date string properly
            LocalDateTime dueDateTime;
            try {
                // Try parsing with ISO format first (handles Z timezone)
                DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_DATE_TIME;
                dueDateTime = LocalDateTime.parse(dueDate, isoFormatter);
                logger.info("📅 Date parsed successfully: {}", dueDateTime);
            } catch (DateTimeParseException e) {
                // Fallback: try parsing without timezone
                try {
                    dueDateTime = LocalDateTime.parse(dueDate);
                    logger.info("📅 Date parsed with fallback: {}", dueDateTime);
                } catch (DateTimeParseException e2) {
                    logger.error("❌ Date parsing failed: {}", dueDate);
                    throw new Exception("Invalid date format. Please use format: yyyy-MM-ddTHH:mm:ss");
                }
            }
            homeworkRequest.setDueDate(dueDateTime);
            
            logger.info("📤 Calling homeworkService.createHomework()...");
            Homework homework = homeworkService.createHomework(homeworkRequest, file, audioFile, teacherEmail);
            
            logger.info("✅ Homework created successfully with ID: {}", homework.getId());
            logger.info("📧 Email notifications should be triggered automatically by NotificationService");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Homework created successfully");
            response.put("id", homework.getId());
            
            logger.info("🎉 HOMEWORK CREATION COMPLETED - ID: {}, Title: '{}'", homework.getId(), homework.getTitle());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("❌ Failed to create homework", e);
            logger.error("🔍 Error details - Type: {}, Message: {}", e.getClass().getSimpleName(), e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create homework: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/test")
    public String test() {
        return "HomeworkController test method is working!";
    }
    
    /**
     * Test endpoint to verify frontend-backend communication and authentication
     */
    @PostMapping("/test-auth")
    public ResponseEntity<?> testAuthentication(@RequestHeader("Authorization") String authHeader) {
        try {
            logger.info("🔍 TEST AUTHENTICATION REQUEST RECEIVED");
            logger.info("🔑 Auth header: {}", authHeader != null ? authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "NULL");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("❌ Invalid authorization header");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            logger.info("🔑 Token extracted: {}", token.substring(0, Math.min(20, token.length())) + "...");
            
            // Test JWT token validation
            if (!jwtTokenProvider.validateToken(token)) {
                logger.error("❌ JWT token validation failed");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired JWT token");
                return ResponseEntity.status(401).body(error);
            }
            
            // Extract user information
            String email = jwtTokenProvider.getEmailFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            logger.info("✅ JWT token validation successful");
            logger.info("👤 User email: {}", email);
            logger.info("👤 User role: {}", role);
            logger.info("👤 User ID: {}", userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Authentication test successful");
            response.put("email", email);
            response.put("role", role);
            response.put("userId", userId);
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            
            logger.info("🎉 AUTHENTICATION TEST COMPLETED SUCCESSFULLY");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Authentication test failed", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Authentication test failed: " + e.getMessage());
            error.put("error", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherHomework(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            
            // Debug: Log the token and extracted email
            logger.debug("Auth header: {}", authHeader);
            logger.debug("Token: {}", token);
            logger.debug("Extracted teacher email: {}", teacherEmail);
            
            if (teacherEmail == null) {
                logger.error("Failed to extract email from token");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid token: Could not extract email");
                return ResponseEntity.status(401).body(error);
            }
            
            logger.debug("Fetching homework for teacher: {}", teacherEmail);
            
            List<HomeworkResponse> homeworks = homeworkService.getTeacherHomework(teacherEmail);
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
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String studentEmail = jwtTokenProvider.getEmailFromToken(token);
            User user = userService.getUserByEmail(studentEmail);
            
            if (user.getParentOfStudentId() != null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid endpoint for parent users"));
            }
            
            logger.debug("Fetching homework for student: {}", studentEmail);
            List<StudentHomeworkResponse> homeworks = homeworkService.getStudentHomework(studentEmail, subject, sortBy, sortOrder);
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
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String parentEmail = jwtTokenProvider.getEmailFromToken(token);
            User parent = userService.getUserByEmail(parentEmail);
            
            if (parent.getParentOfStudentId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid endpoint for student users"));
            }
            
            logger.debug("Fetching homework for parent: {}", parentEmail);
            List<StudentHomeworkResponse> homeworks = homeworkService.getParentHomework(parentEmail, subject, sortBy, sortOrder);
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
            
            // Convert to DTO to avoid lazy loading issues
            HomeworkResponse homeworkResponse = new HomeworkResponse(homework);
            
            return ResponseEntity.ok(homeworkResponse);
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
            @RequestParam(value = "title", required = true) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "subject", required = true) String subject,
            @RequestParam(value = "grade", required = true) Integer grade,
            @RequestParam(value = "classGrade", required = true) String classGrade,
            @RequestParam(value = "classId", required = true) Long classId,
            @RequestParam(value = "dueDate", required = true) String dueDate,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
            
            if (teacherEmail == null) {
                logger.error("Failed to extract email from token");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid token: Could not extract email");
                return ResponseEntity.status(401).body(error);
            }
            
            logger.debug("Updating homework {} for teacher: {}", id, teacherEmail);
            
            // Create HomeworkRequest from individual parameters
            HomeworkRequest homeworkRequest = new HomeworkRequest();
            homeworkRequest.setTitle(title);
            homeworkRequest.setDescription(description);
            homeworkRequest.setSubject(subject);
            homeworkRequest.setGrade(grade);
            homeworkRequest.setClassGrade(classGrade);
            homeworkRequest.setClassId(classId);
            
            // Parse the ISO date string properly
            LocalDateTime dueDateTime;
            try {
                // Try parsing with ISO format first (handles Z timezone)
                DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_DATE_TIME;
                dueDateTime = LocalDateTime.parse(dueDate, isoFormatter);
            } catch (DateTimeParseException e) {
                // Fallback: try parsing without timezone
                try {
                    dueDateTime = LocalDateTime.parse(dueDate);
                } catch (DateTimeParseException e2) {
                    throw new Exception("Invalid date format. Please use format: yyyy-MM-ddTHH:mm:ss");
                }
            }
            homeworkRequest.setDueDate(dueDateTime);
            
            Homework homework = homeworkService.updateHomework(id, homeworkRequest, file, audioFile, teacherEmail);
            
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
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            if (!jwtTokenProvider.validateToken(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(401).body(error);
            }

            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
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
    
    // Homework Submission Endpoints
    @PostMapping("/submit")
    public ResponseEntity<?> submitHomework(
            @RequestParam("homeworkId") Long homeworkId,
            @RequestParam(value = "submissionText", required = false) String submissionText,
            @RequestParam(value = "submissionType", required = false) String submissionType,
            @RequestParam(value = "audioData", required = false) String audioData,
            @RequestParam(value = "imageData", required = false) String imageData,
            @RequestParam(value = "pdfData", required = false) String pdfData,
            @RequestPart(value = "voiceFile", required = false) MultipartFile voiceFile,
            @RequestPart(value = "photoFile", required = false) MultipartFile photoFile,
            @RequestPart(value = "pdfFile", required = false) MultipartFile pdfFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String studentEmail = jwtTokenProvider.getEmailFromToken(token);
            logger.debug("Processing homework submission for student: {}", studentEmail);
            
            // Create HomeworkSubmissionRequest from individual parameters
            HomeworkSubmissionRequest request = new HomeworkSubmissionRequest();
            request.setHomeworkId(homeworkId);
            request.setSubmissionText(submissionText);
            request.setSubmissionType(submissionType);
            request.setAudioData(audioData);
            request.setImageData(imageData);
            request.setPdfData(pdfData);
            
            // Handle file uploads if present - convert to base64 data
            if (voiceFile != null && !voiceFile.isEmpty()) {
                try {
                    byte[] audioBytes = voiceFile.getBytes();
                    String audioBase64 = Base64.getEncoder().encodeToString(audioBytes);
                    request.setAudioData(audioBase64);
                } catch (IOException e) {
                    logger.error("Error converting voice file to base64", e);
                    throw new RuntimeException("Failed to process voice file");
                }
            }
            
            if (photoFile != null && !photoFile.isEmpty()) {
                try {
                    byte[] imageBytes = photoFile.getBytes();
                    String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);
                    request.setImageData(imageBase64);
                } catch (IOException e) {
                    logger.error("Error converting photo file to base64", e);
                    throw new RuntimeException("Failed to process photo file");
                }
            }
            
            if (pdfFile != null && !pdfFile.isEmpty()) {
                try {
                    byte[] pdfBytes = pdfFile.getBytes();
                    String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
                    request.setPdfData(pdfBase64);
                } catch (IOException e) {
                    logger.error("Error converting PDF file to base64", e);
                    throw new RuntimeException("Failed to process PDF file");
                }
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
    
    @GetMapping("/submissions/homework/{homeworkId}")
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
    
    @GetMapping("/submissions/student")
    public ResponseEntity<?> getStudentSubmissions(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String studentEmail = jwtTokenProvider.getEmailFromToken(token);
            User student = userService.getUserByEmail(studentEmail);
            
            List<HomeworkSubmissionResponse> submissions = submissionService.getStudentSubmissions(student.getId());
            logger.debug("Found {} submissions for student: {}", submissions.size(), studentEmail);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Failed to fetch student submissions", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch submissions: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> gradeRequest,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String token = authHeader.substring(7);
            if (!jwtTokenProvider.validateToken(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            String teacherEmail = jwtTokenProvider.getEmailFromToken(token);
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
    
    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<?> getSubmission(@PathVariable Long submissionId) {
        try {
            HomeworkSubmissionResponse submission = submissionService.getSubmissionById(submissionId);
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving submission: " + e.getMessage());
        }
    }
    
    @PutMapping("/submissions/{submissionId}")
    public ResponseEntity<?> updateSubmission(
            @PathVariable Long submissionId,
            @RequestParam(value = "homeworkId", required = false) Long homeworkId,
            @RequestParam(value = "submissionText", required = false) String submissionText,
            @RequestParam(value = "submissionType", required = false) String submissionType,
            @RequestParam(value = "audioData", required = false) String audioData,
            @RequestParam(value = "imageData", required = false) String imageData,
            @RequestParam(value = "pdfData", required = false) String pdfData,
            @RequestParam(value = "voiceFile", required = false) MultipartFile voiceFile,
            @RequestParam(value = "photoFile", required = false) MultipartFile photoFile,
            @RequestParam(value = "pdfFile", required = false) MultipartFile pdfFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid authorization header");
                return ResponseEntity.status(401).body(error);
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String studentEmail = jwtTokenProvider.getEmailFromToken(token);
            logger.debug("Updating homework submission {} for student: {}", submissionId, studentEmail);
            
            // Create the request object from individual parameters
            HomeworkSubmissionRequest request = new HomeworkSubmissionRequest();
            if (homeworkId != null) request.setHomeworkId(homeworkId);
            if (submissionText != null) request.setSubmissionText(submissionText);
            if (submissionType != null) request.setSubmissionType(submissionType);
            if (audioData != null) request.setAudioData(audioData);
            if (imageData != null) request.setImageData(imageData);
            if (pdfData != null) request.setPdfData(pdfData);
            
            // Handle file uploads if present - convert to base64 data
            if (voiceFile != null && !voiceFile.isEmpty()) {
                try {
                    byte[] audioBytes = voiceFile.getBytes();
                    String audioBase64 = Base64.getEncoder().encodeToString(audioBytes);
                    request.setAudioData(audioBase64);
                } catch (IOException e) {
                    logger.error("Error converting voice file to base64", e);
                    throw new RuntimeException("Failed to process voice file");
                }
            }
            
            if (photoFile != null && !photoFile.isEmpty()) {
                try {
                    byte[] imageBytes = photoFile.getBytes();
                    String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);
                    request.setImageData(imageBase64);
                } catch (IOException e) {
                    logger.error("Error converting photo file to base64", e);
                    throw new RuntimeException("Failed to process photo file");
                }
            }
            
            if (pdfFile != null && !pdfFile.isEmpty()) {
                try {
                    byte[] pdfBytes = pdfFile.getBytes();
                    String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);
                    request.setPdfData(pdfBase64);
                } catch (IOException e) {
                    logger.error("Error converting PDF file to base64", e);
                    throw new RuntimeException("Failed to process PDF file");
                }
            }
            
            HomeworkSubmissionResponse updatedSubmission = submissionService.updateSubmission(submissionId, request, studentEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Submission updated successfully");
            result.put("submission", updatedSubmission);
            
            logger.debug("Submission updated successfully with ID: {}", updatedSubmission.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Failed to update submission", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update submission: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/submissions/homework/{homeworkId}/stats")
    public ResponseEntity<?> getHomeworkStats(@PathVariable Long homeworkId) {
        try {
            long totalSubmissions = submissionService.getHomeworkSubmissions(homeworkId).size();
            long gradedSubmissions = submissionService.getHomeworkSubmissions(homeworkId)
                .stream()
                .filter(sub -> "GRADED".equals(sub.getStatus()))
                .count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalSubmissions", totalSubmissions);
            stats.put("gradedSubmissions", gradedSubmissions);
            stats.put("pendingSubmissions", totalSubmissions - gradedSubmissions);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Failed to get homework stats", e);
            return ResponseEntity.badRequest().body("Error retrieving homework stats: " + e.getMessage());
        }
    }

    // Notification endpoints have been moved to NotificationController
    // All notification functionality is now handled by /homework/notifications endpoints
    
    // Class Management endpoints
    @PostMapping("/classes")
    public ResponseEntity<?> createClass(@RequestBody ClassRequest request) {
        try {
            ClassResponse newClass = classService.createClass(request);
            return ResponseEntity.ok(newClass);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating class: " + e.getMessage());
        }
    }
    
    @GetMapping("/classes/{classId}")
    public ResponseEntity<?> getClassById(@PathVariable Long classId) {
        try {
            ClassResponse classResponse = classService.getClassById(classId);
            return ResponseEntity.ok(classResponse);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/classes/{classId}/statistics")
    public ResponseEntity<?> getClassWithStatistics(@PathVariable Long classId) {
        try {
            ClassResponse classResponse = classService.getClassWithStatistics(classId);
            return ResponseEntity.ok(classResponse);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/classes/teacher/{teacherId}")
    public ResponseEntity<?> getClassesByTeacher(@PathVariable Long teacherId) {
        try {
            List<ClassResponse> classes = classService.getClassesByTeacher(teacherId);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving classes: " + e.getMessage());
        }
    }
    
    @GetMapping("/classes/teacher/current")
    public ResponseEntity<?> getClassesByCurrentTeacher(@RequestHeader("Authorization") String authHeader) {
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
            User teacher = userService.getUserByEmail(teacherEmail);
            
            if (teacher == null || teacher.getRole() != UserRole.TEACHER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. User is not a teacher."));
            }
            
            List<ClassResponse> classes = classService.getClassesByTeacher(teacher.getId());
            return ResponseEntity.ok(classes);
            
        } catch (Exception e) {
            logger.error("Error fetching classes for current teacher: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch classes: " + e.getMessage()));
        }
    }
    
    @GetMapping("/classes/teacher/{teacherId}/statistics")
    public ResponseEntity<?> getClassesByTeacherWithStatistics(@PathVariable Long teacherId) {
        try {
            List<ClassResponse> classes = classService.getClassesByTeacherWithStatistics(teacherId);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving classes: " + e.getMessage());
        }
    }
    
    @GetMapping("/classes/student/{studentId}")
    public ResponseEntity<?> getClassesByStudent(@PathVariable Long studentId) {
        try {
            List<ClassResponse> classes = classService.getClassesByStudent(studentId);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving classes: " + e.getMessage());
        }
    }
    
    @GetMapping("/classes")
    public ResponseEntity<?> getAllActiveClasses() {
        try {
            List<ClassResponse> classes = classService.getAllActiveClasses();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving classes: " + e.getMessage());
        }
    }
    
    @GetMapping("/classes/search")
    public ResponseEntity<?> searchClasses(@RequestParam String query) {
        try {
            List<ClassResponse> classes = classService.searchClasses(query);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching classes: " + e.getMessage());
        }
    }
    
    @PutMapping("/classes/{classId}")
    public ResponseEntity<?> updateClass(@PathVariable Long classId, @RequestBody ClassRequest request) {
        try {
            ClassResponse updatedClass = classService.updateClass(classId, request);
            return ResponseEntity.ok(updatedClass);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating class: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/classes/{classId}")
    public ResponseEntity<?> deactivateClass(@PathVariable Long classId) {
        try {
            classService.deactivateClass(classId);
            return ResponseEntity.ok("Class deactivated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deactivating class: " + e.getMessage());
        }
    }
    
    @GetMapping("/classes/test")
    public ResponseEntity<String> classTest() {
        return ResponseEntity.ok("Class endpoints are working from HomeworkController!");
    }
    
    @GetMapping("/statistics/student/{studentId}")
    public ResponseEntity<?> getStudentHomeworkStatistics(@PathVariable Long studentId) {
        try {
            Map<String, Object> stats = homeworkService.getStudentHomeworkStatistics(studentId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting student homework statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get student statistics"));
        }
    }
} 