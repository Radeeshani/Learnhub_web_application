package com.homework.service;

import com.homework.dto.HomeworkRequest;
import com.homework.entity.Homework;
import com.homework.entity.User;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class HomeworkService {
    
    @Autowired
    private HomeworkRepository homeworkRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final Path fileStoragePath = Paths.get("uploads/homework");
    
    public HomeworkService() {
        try {
            Files.createDirectories(fileStoragePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }
    
    public Homework createHomework(HomeworkRequest request, MultipartFile file, String teacherEmail) throws IOException {
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        Homework homework = new Homework();
        homework.setTitle(request.getTitle());
        homework.setDescription(request.getDescription());
        homework.setSubject(request.getSubject());
        homework.setClassGrade(request.getClassGrade());
        homework.setDueDate(request.getDueDate());
        homework.setTeacher(teacher);
        
        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = fileStoragePath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation);
            
            homework.setFileName(file.getOriginalFilename());
            homework.setFileUrl("/uploads/homework/" + fileName);
        }
        
        return homeworkRepository.save(homework);
    }
    
    public List<Homework> getTeacherHomework(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return homeworkRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId());
    }
    
    public List<Homework> getHomeworkByGrade(String classGrade) {
        return homeworkRepository.findByClassGradeOrderByDueDateAsc(classGrade);
    }
    
    public Homework getHomework(Long id) {
        return homeworkRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Homework not found"));
    }
} 