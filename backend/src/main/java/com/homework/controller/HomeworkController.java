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
import com.homework.dto.HomeworkSubmissionRequest;
import com.homework.dto.HomeworkSubmissionResponse;
import com.homework.entity.User;
import com.homework.service.HomeworkSubmissionService;
import com.homework.service.UserService;
import com.homework.entity.Notification;
import com.homework.service.NotificationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
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
    private NotificationService notificationService;
    
    @Autowired
    private CalendarService calendarService;
    
    @Autowired
    private ClassService classService;
    
    // Calendar endpoints
    @GetMapping("/calendar/test")
    public ResponseEntity<String> calendarTest() {
        return ResponseEntity.ok("Calendar endpoints are working from HomeworkController!");
    }

    @GetMapping("/calendar/events")
    public ResponseEntity<?> getCalendarEvents() {
        try {
            // For now, get events for user ID 1 (first student)
            List<CalendarEvent> events = calendarService.getUpcomingEvents(1L, 30);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving calendar events: " + e.getMessage());
        }
    }

    @PostMapping("/calendar/events")
    public ResponseEntity<?> createCalendarEvent(@RequestBody CalendarEventRequest request) {
        try {
            // Convert request to entity and create event
            CalendarEvent event = new CalendarEvent();
            event.setTitle(request.getTitle());
            event.setDescription(request.getDescription());
            event.setStartTime(request.getStartTime());
            event.setEndTime(request.getEndTime());
            event.setAllDay(request.isAllDay());
            event.setEventType(request.getEventTypeEnum());
            event.setUserId(1L); // Temporary user ID
            event.setHomeworkId(request.getHomeworkId());
            event.setClassId(request.getClassId());
            event.setColor(request.getColor() != null ? request.getColor() : "#3B82F6");
            event.setLocation(request.getLocation());
            event.setRecurring(request.isRecurring());
            event.setRecurrencePattern(request.getRecurrencePattern());
            
            CalendarEvent savedEvent = calendarService.createEvent(event);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating calendar event: " + e.getMessage());
        }
    }

    // Get calendar events with different views
    @GetMapping("/calendar/events/view")
    public ResponseEntity<?> getCalendarEventsByView(
            @RequestParam(required = false) String view,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            List<CalendarEvent> events;
            
            if ("today".equals(view)) {
                events = calendarService.getTodayEvents(1L);
            } else if ("week".equals(view)) {
                events = calendarService.getWeekEvents(1L);
            } else if ("month".equals(view)) {
                events = calendarService.getMonthEvents(1L);
            } else if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDateTime.parse(startDate);
                LocalDateTime end = LocalDateTime.parse(endDate);
                events = calendarService.getUserEventsInRange(1L, start, end);
            } else {
                // Default to upcoming events (next 30 days)
                events = calendarService.getUpcomingEvents(1L, 30);
            }
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving calendar events: " + e.getMessage());
        }
    }

    // Search calendar events
    @GetMapping("/calendar/search")
    public ResponseEntity<?> searchCalendarEvents(@RequestParam String query) {
        try {
            // For now, search events for user ID 1 (first student)
            List<CalendarEvent> events = calendarService.searchEvents(1L, query);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching calendar events: " + e.getMessage());
        }
    }

    // Get calendar summary
    @GetMapping("/calendar/summary")
    public ResponseEntity<?> getCalendarSummary() {
        try {
            // For now, get summary for user ID 1 (first student)
            java.util.Map<CalendarEvent.EventType, Long> summary = calendarService.getCalendarSummary(1L);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting calendar summary: " + e.getMessage());
        }
    }
    
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
    
    @GetMapping("/test")
    public String test() {
        return "HomeworkController test method is working!";
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
    
    // Homework Submission Endpoints
    @PostMapping("/submit")
    public ResponseEntity<?> submitHomework(
            @RequestPart("submission") HomeworkSubmissionRequest request,
            @RequestPart(value = "voiceFile", required = false) MultipartFile voiceFile,
            @RequestPart(value = "photoFile", required = false) MultipartFile photoFile,
            @RequestPart(value = "pdfFile", required = false) MultipartFile pdfFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String studentEmail = authHeader.substring(7);
            logger.debug("Processing homework submission for student: {}", studentEmail);
            
            // Handle file uploads if present
            if (voiceFile != null && !voiceFile.isEmpty()) {
                request.setVoiceRecordingUrl("voice_uploaded_" + System.currentTimeMillis() + ".wav");
            }
            
            if (photoFile != null && !photoFile.isEmpty()) {
                request.setPhotoUrl("photo_uploaded_" + System.currentTimeMillis() + ".jpg");
            }
            
            if (pdfFile != null && !pdfFile.isEmpty()) {
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
            String studentEmail = authHeader.substring(7);
            // For now, get submissions for user ID 1 (first student)
            // In a real system, this would extract user ID from JWT token
            List<HomeworkSubmissionResponse> submissions = submissionService.getStudentSubmissions(1L);
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
            @RequestPart("submission") HomeworkSubmissionRequest request,
            @RequestPart(value = "voiceFile", required = false) MultipartFile voiceFile,
            @RequestPart(value = "photoFile", required = false) MultipartFile photoFile,
            @RequestPart(value = "pdfFile", required = false) MultipartFile pdfFile,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String studentEmail = authHeader.substring(7);
            logger.debug("Updating homework submission {} for student: {}", submissionId, studentEmail);
            
            // Handle file uploads if present
            if (voiceFile != null && !voiceFile.isEmpty()) {
                request.setVoiceRecordingUrl("voice_uploaded_" + System.currentTimeMillis() + ".wav");
            }
            
            if (photoFile != null && !photoFile.isEmpty()) {
                request.setPhotoUrl("photo_uploaded_" + System.currentTimeMillis() + ".jpg");
            }
            
            if (pdfFile != null && !pdfFile.isEmpty()) {
                request.setPdfUrl("pdf_uploaded_" + System.currentTimeMillis() + ".pdf");
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

    // Notification endpoints (since new controllers are not being detected)
    
    @GetMapping("/notifications/user")
    public ResponseEntity<?> getUserNotifications() {
        try {
            // For now, return notifications for user ID 1 (first student)
            // In a real system, this would extract user ID from JWT token
            List<Notification> notifications = notificationService.getUserNotifications(1L);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Failed to fetch user notifications", e);
            return ResponseEntity.badRequest().body("Error retrieving notifications: " + e.getMessage());
        }
    }
    
    @GetMapping("/notifications/user/unread")
    public ResponseEntity<?> getUserUnreadNotifications() {
        try {
            // For now, return unread notifications for user ID 1
            List<Notification> notifications = notificationService.getUserUnreadNotifications(1L);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Failed to fetch unread notifications", e);
            return ResponseEntity.badRequest().body("Error retrieving unread notifications: " + e.getMessage());
        }
    }
    
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        try {
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            logger.error("Failed to mark notification as read", e);
            return ResponseEntity.badRequest().body("Error marking notification as read: " + e.getMessage());
        }
    }
    
    @PutMapping("/notifications/mark-all-read")
    public ResponseEntity<?> markAllNotificationsAsRead() {
        try {
            // For now, mark all as read for user ID 1
            notificationService.markAllAsRead(1L);
            return ResponseEntity.ok().body("All notifications marked as read");
        } catch (Exception e) {
            logger.error("Failed to mark all notifications as read", e);
            return ResponseEntity.badRequest().body("Error marking all notifications as read: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok().body("Notification deleted successfully");
        } catch (Exception e) {
            logger.error("Failed to delete notification", e);
            return ResponseEntity.badRequest().body("Error deleting notification: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/notifications/clear-all")
    public ResponseEntity<?> clearAllNotifications() {
        try {
            // For now, clear all for user ID 1
            notificationService.clearAllNotifications(1L);
            return ResponseEntity.ok().body("All notifications cleared");
        } catch (Exception e) {
            logger.error("Failed to clear all notifications", e);
            return ResponseEntity.badRequest().body("Error clearing all notifications: " + e.getMessage());
        }
    }
    
    @GetMapping("/notifications/user/count")
    public ResponseEntity<?> getNotificationCount() {
        try {
            // For now, return count for user ID 1
            long count = notificationService.getUserUnreadNotifications(1L).size();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            logger.error("Failed to get notification count", e);
            return ResponseEntity.badRequest().body("Error retrieving notification count: " + e.getMessage());
        }
    }
    
    @PostMapping("/notifications/test/create")
    public ResponseEntity<?> createTestNotification() {
        try {
            Notification notification = notificationService.createNotification(
                1L, 
                Notification.NotificationType.NEW_HOMEWORK,
                "Test Notification",
                "This is a test notification",
                1L,
                "Test Homework",
                Notification.NotificationPriority.NORMAL
            );
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            logger.error("Failed to create test notification", e);
            return ResponseEntity.badRequest().body("Error creating test notification: " + e.getMessage());
        }
    }
    
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
} 