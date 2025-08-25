package com.homework.service;

import com.homework.dto.HomeworkRequest;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.UserRepository;
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
        homework.setDueDate(request.getDueDate());
        homework.setTeacherId(teacher.getId());
        homework.setFileName(fileName);
        homework.setFileUrl(fileUrl);
        
        Homework savedHomework = homeworkRepository.save(homework);
        
        // Create notification for students about new homework
        notificationService.createNewHomeworkNotification(savedHomework);
        
        // Create reminders for all students in the grade
        reminderService.createHomeworkReminders(savedHomework);
        
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
        homework.setDueDate(request.getDueDate());
        
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
        
        // Delete associated file if exists
        if (homework.getFileName() != null) {
            Path filePath = uploadPath.resolve(homework.getFileName());
            Files.deleteIfExists(filePath);
        }
        
        homeworkRepository.delete(homework);
    }
    
    public List<Homework> getTeacherHomework(String teacherEmail) throws Exception {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new Exception("Teacher not found"));
        
        return homeworkRepository.findByTeacherId(teacher.getId());
    }
    
    public List<Homework> getStudentHomework(String studentEmail, String subject, String sortBy, String sortOrder) throws Exception {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new Exception("Student not found"));
        
        Sort sort = createSort(sortBy, sortOrder);
        List<Homework> homeworks;
        
        if (subject != null && !subject.isEmpty()) {
            homeworks = homeworkRepository.findByClassGradeAndSubject(student.getClassGrade(), subject, sort);
        } else {
            homeworks = homeworkRepository.findByClassGrade(student.getClassGrade(), sort);
        }
        
        return homeworks;
    }
    
    public List<Homework> getParentHomework(String parentEmail, String subject, String sortBy, String sortOrder) throws Exception {
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
} 