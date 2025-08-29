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

@Service
public class HomeworkService {
    
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
    
    private final Path uploadPath = Paths.get("backend/uploads/homework").toAbsolutePath().normalize();
    
    public HomeworkService() {
        try {
            Files.createDirectories(uploadPath);
        } catch (Exception e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }
    
    public Homework createHomework(HomeworkRequest request, MultipartFile file, String teacherEmail) throws Exception {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new Exception("Teacher not found"));
        
        String fileName = null;
        String fileUrl = null;
        
        if (file != null && !file.isEmpty()) {
            fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation);
            fileUrl = "/uploads/homework/" + fileName;
        }
        
        Homework homework = new Homework();
        homework.setTitle(request.getTitle());
        homework.setDescription(request.getDescription());
        homework.setSubject(request.getSubject());
        homework.setClassGrade(request.getClassGrade());
        homework.setGrade(request.getGrade());
        homework.setClassId(request.getClassId());
        homework.setDueDate(request.getDueDate());
        homework.setTeacherId(teacher.getId());
        homework.setFileName(fileName);
        homework.setFileUrl(fileUrl);
        
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
        
        // Create notification for students about new homework
        notificationService.createNewHomeworkNotification(savedHomework);
        
        // Create smart reminders for all students in the grade
        reminderService.createSmartHomeworkReminder(savedHomework);
        
        return savedHomework;
    }

    public Homework updateHomework(Long id, HomeworkRequest request, MultipartFile file, String teacherEmail) throws Exception {
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
        
        homework.setTitle(request.getTitle());
        homework.setDescription(request.getDescription());
        homework.setSubject(request.getSubject());
        homework.setClassGrade(request.getClassGrade());
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
} 