package com.homework.service;

import com.homework.dto.HomeworkRequest;
import com.homework.dto.HomeworkResponse;
import com.homework.dto.StudentHomeworkResponse;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.entity.Class;
import com.homework.entity.Reminder;
import com.homework.entity.HomeworkSubmission;
import com.homework.entity.Notification;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.UserRepository;
import com.homework.repository.ClassRepository;
import com.homework.repository.ReminderRepository;
import com.homework.repository.HomeworkSubmissionRepository;
import com.homework.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class HomeworkService {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeworkService.class);

    @Autowired
    private HomeworkRepository homeworkRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ReminderService reminderService;
    
    @Autowired
    private ClassEnrollmentService classEnrollmentService;
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private ReminderRepository reminderRepository;
    
    @Autowired
    private HomeworkSubmissionRepository homeworkSubmissionRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private EmailService emailService;
    
    private final Path uploadPath = Paths.get("uploads/homework").toAbsolutePath().normalize();
    
    public HomeworkService() {
        try {
            Files.createDirectories(uploadPath);
        } catch (Exception e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }
    
    public Homework createHomework(HomeworkRequest request, MultipartFile file, MultipartFile audioFile, String teacherEmail) throws Exception {
        System.out.println("🚀🚀🚀 HOMEWORK SERVICE CREATE HOMEWORK CALLED! 🚀🚀🚀");
        System.out.println("Title: " + request.getTitle());
        System.out.println("Class Grade: " + request.getClassGrade());
        
        logger.info("🚀 HomeworkService.createHomework() called with title: '{}'", request.getTitle());
        
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new Exception("Teacher not found"));
        
        String fileName = null;
        String fileUrl = null;
        String audioFileName = null;
        String audioFileUrl = null;
        
        if (file != null && !file.isEmpty()) {
            fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation);
            fileUrl = "/uploads/homework/" + fileName;
        }
        
        if (audioFile != null && !audioFile.isEmpty()) {
            audioFileName = UUID.randomUUID().toString() + "_" + audioFile.getOriginalFilename();
            Path audioTargetLocation = uploadPath.resolve(audioFileName);
            Files.copy(audioFile.getInputStream(), audioTargetLocation);
            audioFileUrl = "/uploads/homework/" + audioFileName;
        }
        
        Homework homework = new Homework();
        homework.setTitle(request.getTitle());
        homework.setDescription(request.getDescription());
        homework.setSubject(request.getSubject());
        
        // Ensure consistent grade format - convert "Grade X" to "Xth Grade" format
        String normalizedClassGrade = normalizeClassGrade(request.getClassGrade());
        homework.setClassGrade(normalizedClassGrade);
        
        homework.setGrade(request.getGrade());
        homework.setClassId(request.getClassId());
        homework.setDueDate(request.getDueDate());
        homework.setTeacherId(teacher.getId());
        homework.setFileName(fileName);
        homework.setFileUrl(fileUrl);
        homework.setAudioFileName(audioFileName);
        homework.setAudioFileUrl(audioFileUrl);
        
        // Create homework-class relationship
        if (request.getClassId() != null) {
            try {
                Class assignedClass = classRepository.findById(request.getClassId())
                        .orElseThrow(() -> new Exception("Class not found"));
                
                // Add the class to the homework's assigned classes
                homework.getAssignedClasses().add(assignedClass);
            } catch (Exception e) {
                // Log error but don't fail homework creation
                System.err.println("Warning: Could not link homework to class: " + e.getMessage());
            }
        }
        
        Homework savedHomework = homeworkRepository.save(homework);
        
        System.out.println("📝📝📝 HOMEWORK SAVED SUCCESSFULLY: " + savedHomework.getTitle() + " with ID: " + savedHomework.getId());
        
        // Create notification for students about new homework
        try {
            System.out.println("📢📢📢 ABOUT TO CALL NOTIFICATION SERVICE");
            notificationService.createNewHomeworkNotification(savedHomework);
            System.out.println("📢📢📢 NOTIFICATION SERVICE COMPLETED SUCCESSFULLY");
        } catch (Exception e) {
            System.out.println("❌❌❌ NOTIFICATION SERVICE FAILED: " + e.getMessage());
            e.printStackTrace();
            // Continue anyway - don't let notification failure stop email sending
        }
        
        // Send emails to relevant students only (based on class/grade)
        try {
            System.out.println("🔍🔍🔍 STARTING EMAIL LOGIC FOR HOMEWORK: " + savedHomework.getTitle() + " with grade: " + savedHomework.getClassGrade());
            logger.info("🔍 STARTING EMAIL LOGIC FOR HOMEWORK: '{}' with grade: '{}'", savedHomework.getTitle(), savedHomework.getClassGrade());
            
            // Handle class grade format mismatch between homework and students
            String homeworkGrade = savedHomework.getClassGrade();
            List<User> relevantStudents = new ArrayList<>();
            
            logger.info("🔍 Looking for students with exact grade: '{}'", homeworkGrade);
            
            // Try to find students with the exact grade first
            List<User> exactMatchStudents = userRepository.findByClassGrade(homeworkGrade);
            relevantStudents.addAll(exactMatchStudents);
            
            logger.info("🔍 Found {} students with exact grade match", exactMatchStudents.size());
            
            // If no exact match, try alternative formats
            if (relevantStudents.isEmpty() && homeworkGrade != null) {
                logger.info("🔍 No exact match found, trying alternative formats...");
                
                // Convert "Grade X" to "Xth Grade" format
                if (homeworkGrade.startsWith("Grade ")) {
                    logger.info("🔍 Converting 'Grade X' format: '{}'", homeworkGrade);
                    String number = homeworkGrade.substring(6).trim();
                    try {
                        int gradeNum = Integer.parseInt(number);
                        String alternativeFormat = getOrdinalGrade(gradeNum);
                        logger.info("🔍 Converted to: '{}'", alternativeFormat);
                        
                        List<User> altFormatStudents = userRepository.findByClassGrade(alternativeFormat);
                        relevantStudents.addAll(altFormatStudents);
                        logger.info("✅ Converted '{}' to '{}' and found {} students", homeworkGrade, alternativeFormat, altFormatStudents.size());
                    } catch (NumberFormatException e) {
                        logger.warn("❌ Could not parse grade number from: {}", homeworkGrade);
                    }
                }
                // Convert "Xth Grade" to "Grade X" format
                else if (homeworkGrade.matches(".*\\d+.*Grade.*")) {
                    logger.info("🔍 Converting 'Xth Grade' format: '{}'", homeworkGrade);
                    String number = homeworkGrade.replaceAll("[^0-9]", "");
                    try {
                        int gradeNum = Integer.parseInt(number);
                        String alternativeFormat = "Grade " + gradeNum;
                        logger.info("🔍 Converted to: '{}'", alternativeFormat);
                        
                        List<User> altFormatStudents = userRepository.findByClassGrade(alternativeFormat);
                        relevantStudents.addAll(altFormatStudents);
                        logger.info("✅ Converted '{}' to '{}' and found {} students", homeworkGrade, alternativeFormat, altFormatStudents.size());
                    } catch (NumberFormatException e) {
                        logger.warn("❌ Could not parse grade number from: {}", homeworkGrade);
                    }
                }
            }
            
            // Filter to only include students and remove duplicates
            relevantStudents = relevantStudents.stream()
                .filter(student -> student.getRole().toString().equals("STUDENT"))
                .distinct()
                .toList();
            
            logger.info("🔍 Final student count after filtering: {}", relevantStudents.size());
            
            if (!relevantStudents.isEmpty()) {
                System.out.println("✅✅✅ FOUND " + relevantStudents.size() + " STUDENTS FOR HOMEWORK GRADE: " + homeworkGrade);
                logger.info("✅ Found {} students for homework grade '{}'", relevantStudents.size(), homeworkGrade);
                logger.info("🔍 About to send emails to {} students", relevantStudents.size());
                System.out.println("📧📧📧 ABOUT TO CALL EMAIL SERVICE");
                emailService.sendNewHomeworkEmail(savedHomework, relevantStudents);
                System.out.println("✅✅✅ EMAIL SERVICE CALL COMPLETED");
                logger.info("✅ Email sending completed");
            } else {
                System.out.println("❌❌❌ NO STUDENTS FOUND FOR HOMEWORK GRADE: " + homeworkGrade);
                logger.warn("❌ No students found for homework grade '{}'", homeworkGrade);
            }
        } catch (Exception e) {
            System.out.println("❌❌❌ EMAIL LOGIC FAILED: " + e.getMessage());
            e.printStackTrace();
            logger.error("❌ Failed to send homework emails: {}", e.getMessage(), e);
            // Don't fail homework creation if email fails
        }
        
        // Create smart reminders for all students in the grade
        try {
            System.out.println("⏰⏰⏰ ABOUT TO CALL REMINDER SERVICE");
            reminderService.createSmartHomeworkReminder(savedHomework);
            System.out.println("⏰⏰⏰ REMINDER SERVICE COMPLETED SUCCESSFULLY");
        } catch (Exception e) {
            System.out.println("❌❌❌ REMINDER SERVICE FAILED: " + e.getMessage());
            e.printStackTrace();
            // Continue anyway - don't let reminder failure stop the process
        }
        
        logger.info("🎉 HomeworkService.createHomework() completed successfully for: '{}'", savedHomework.getTitle());
        
        return savedHomework;
    }

    public Homework updateHomework(Long id, HomeworkRequest request, MultipartFile file, MultipartFile audioFile, String teacherEmail) throws Exception {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new Exception("Teacher not found"));
        
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new Exception("Homework not found"));
        
        if (!homework.getTeacherId().equals(teacher.getId())) {
            throw new Exception("Not authorized to update this homework");
        }
        
        // If new file is uploaded, delete old file and save new one
        if (file != null && !file.isEmpty()) {
            if (homework.getFileName() != null) {
                Path oldFile = uploadPath.resolve(homework.getFileName());
                Files.deleteIfExists(oldFile);
            }
            
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation);
            
            homework.setFileName(fileName);
            homework.setFileUrl("/uploads/homework/" + fileName);
        }
        
        // If new audio file is uploaded, delete old audio file and save new one
        if (audioFile != null && !audioFile.isEmpty()) {
            if (homework.getAudioFileName() != null) {
                Path oldAudioFile = uploadPath.resolve(homework.getAudioFileName());
                Files.deleteIfExists(oldAudioFile);
            }
            
            String audioFileName = UUID.randomUUID().toString() + "_" + audioFile.getOriginalFilename();
            Path audioTargetLocation = uploadPath.resolve(audioFileName);
            Files.copy(audioFile.getInputStream(), audioTargetLocation);
            
            homework.setAudioFileName(audioFileName);
            homework.setAudioFileUrl("/uploads/homework/" + audioFileName);
        }
        
        homework.setTitle(request.getTitle());
        homework.setDescription(request.getDescription());
        homework.setSubject(request.getSubject());
        
        // Ensure consistent grade format
        String normalizedClassGrade = normalizeClassGrade(request.getClassGrade());
        homework.setClassGrade(normalizedClassGrade);
        
        homework.setGrade(request.getGrade());
        homework.setClassId(request.getClassId());
        homework.setDueDate(request.getDueDate());
        
        // Update homework-class relationship
        if (request.getClassId() != null) {
            try {
                Class assignedClass = classRepository.findById(request.getClassId())
                        .orElseThrow(() -> new Exception("Class not found"));
                
                // Clear existing assignments and add the new one
                homework.getAssignedClasses().clear();
                homework.getAssignedClasses().add(assignedClass);
            } catch (Exception e) {
                // Log error but don't fail homework update
                System.err.println("Warning: Could not link homework to class: " + e.getMessage());
            }
        }
        
        return homeworkRepository.save(homework);
    }

    public void deleteHomework(Long id, String teacherEmail) throws Exception {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new Exception("Teacher not found"));
        
        Homework homework = homeworkRepository.findById(id)
                .orElseThrow(() -> new Exception("Homework not found"));
        
        if (!homework.getTeacherId().equals(teacher.getId())) {
            throw new Exception("Not authorized to delete this homework");
        }
        
        // Delete related reminders first to avoid foreign key constraint violation
        List<Reminder> relatedReminders = reminderRepository.findByHomeworkId(id);
        if (!relatedReminders.isEmpty()) {
            reminderRepository.deleteAll(relatedReminders);
        }
        
        // Delete related homework submissions to avoid foreign key constraint violation
        List<HomeworkSubmission> relatedSubmissions = homeworkSubmissionRepository.findByHomeworkId(id);
        if (!relatedSubmissions.isEmpty()) {
            homeworkSubmissionRepository.deleteAll(relatedSubmissions);
        }
        
        // Delete related notifications to avoid foreign key constraint violation
        List<Notification> relatedNotifications = notificationRepository.findByHomeworkIdOrderByCreatedAtDesc(id);
        if (!relatedNotifications.isEmpty()) {
            notificationRepository.deleteAll(relatedNotifications);
        }
        
        // Delete associated file if exists
        if (homework.getFileName() != null) {
            Path filePath = uploadPath.resolve(homework.getFileName());
            Files.deleteIfExists(filePath);
        }
        
        homeworkRepository.delete(homework);
    }
    
    public List<HomeworkResponse> getTeacherHomework(String teacherEmail) throws Exception {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new Exception("Teacher not found"));
        
        // Fetch homework entities and convert to DTOs to avoid lazy loading issues
        List<Homework> homeworks = homeworkRepository.findByTeacherId(teacher.getId());
        return homeworks.stream()
                .map(HomeworkResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<StudentHomeworkResponse> getStudentHomework(String studentEmail, String subject, String sortBy, String sortOrder) throws Exception {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new Exception("Student not found"));
        
        Sort sort = createSort(sortBy, sortOrder);
        List<Homework> homeworks;
        
        // Get class IDs where the student is enrolled
        List<Long> enrolledClassIds = classEnrollmentService.getStudentEnrolledClassIds(student.getId());
        
        if (enrolledClassIds.isEmpty()) {
            // Fallback to class_grade approach if no enrolled classes found
            if (subject != null && !subject.isEmpty()) {
                homeworks = homeworkRepository.findByClassGradeAndSubject(student.getClassGrade(), subject, sort);
            } else {
                homeworks = homeworkRepository.findByClassGrade(student.getClassGrade(), sort);
            }
        } else {
            // Use proper class enrollment filtering
            if (subject != null && !subject.isEmpty()) {
                homeworks = homeworkRepository.findByClassIdInAndSubject(enrolledClassIds, subject, sort);
            } else {
                homeworks = homeworkRepository.findByClassIdIn(enrolledClassIds, sort);
            }
        }
        
        // Convert to DTOs to avoid lazy loading issues
        return homeworks.stream()
                .map(StudentHomeworkResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<StudentHomeworkResponse> getParentHomework(String parentEmail, String subject, String sortBy, String sortOrder) throws Exception {
        User parent = userRepository.findByEmail(parentEmail)
                .orElseThrow(() -> new Exception("Parent not found"));
        
        if (parent.getParentOfStudentId() == null) {
            return Collections.emptyList();
        }
        
        User student = userRepository.findById(parent.getParentOfStudentId())
                .orElseThrow(() -> new Exception("Student not found"));
        
        return getStudentHomework(student.getEmail(), subject, sortBy, sortOrder);
    }
    
    public List<Homework> getHomeworkByGrade(String classGrade) {
        Sort sort = Sort.by(Sort.Direction.DESC, "dueDate");
        String grade = classGrade.replaceAll("[^0-9]", "");
        return homeworkRepository.findByClassGrade(grade, sort);
    }
    
    public Homework getHomework(Long id) throws Exception {
        return homeworkRepository.findById(id)
                .orElseThrow(() -> new Exception("Homework not found"));
    }
    
    private Sort createSort(String sortBy, String sortOrder) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        if (sortBy == null || sortBy.isEmpty()) {
            return Sort.by(direction, "dueDate");
        }
        
        return Sort.by(direction, sortBy);
    }
    
    public Map<String, Object> getStudentHomeworkStatistics(Long studentId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Get total homeworks for the student
            List<Long> enrolledClassIds = classEnrollmentService.getStudentEnrolledClassIds(studentId);
            List<Homework> totalHomeworks = new ArrayList<>();
            
            if (!enrolledClassIds.isEmpty()) {
                totalHomeworks = homeworkRepository.findByClassIdIn(enrolledClassIds, Sort.by(Sort.Direction.DESC, "dueDate"));
            }
            
            // For now, we'll set basic statistics
            // In a real implementation, you'd check homework submission status
            stats.put("totalHomeworks", totalHomeworks.size());
            stats.put("completedHomeworks", 0); // TODO: Implement submission status checking
            stats.put("pendingHomeworks", totalHomeworks.size()); // TODO: Implement submission status checking
            
        } catch (Exception e) {
            // Set default values on error
            stats.put("totalHomeworks", 0);
            stats.put("completedHomeworks", 0);
            stats.put("pendingHomeworks", 0);
        }
        
        return stats;
    }

    private String getOrdinalGrade(int gradeNum) {
        if (gradeNum >= 10 && gradeNum <= 20) {
            return gradeNum + "th Grade";
        }
        switch (gradeNum % 10) {
            case 1:
                return gradeNum + "st Grade";
            case 2:
                return gradeNum + "nd Grade";
            case 3:
                return gradeNum + "rd Grade";
            default:
                return gradeNum + "th Grade";
        }
    }
    
    /**
     * Normalize class grade format to ensure consistency
     * Converts "Grade X" format to "Xth Grade" format
     */
    private String normalizeClassGrade(String classGrade) {
        if (classGrade == null || classGrade.trim().isEmpty()) {
            return classGrade;
        }
        
        String trimmed = classGrade.trim();
        
        // If already in "Xth Grade" format, return as is
        if (trimmed.matches(".*\\d+.*Grade.*")) {
            return trimmed;
        }
        
        // Convert "Grade X" to "Xth Grade" format
        if (trimmed.startsWith("Grade ")) {
            String number = trimmed.substring(6).trim();
            try {
                int gradeNum = Integer.parseInt(number);
                return getOrdinalGrade(gradeNum);
            } catch (NumberFormatException e) {
                logger.warn("Could not parse grade number from: {}", trimmed);
                return trimmed; // Return original if parsing fails
            }
        }
        
        return trimmed; // Return original if no conversion needed
    }
} 