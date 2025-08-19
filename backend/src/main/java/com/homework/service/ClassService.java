package com.homework.service;

import com.homework.dto.ClassRequest;
import com.homework.dto.ClassResponse;
import com.homework.entity.Class;
import com.homework.entity.User;
import com.homework.enums.UserRole;
import com.homework.repository.ClassRepository;
import com.homework.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClassService {
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create a new class
    public ClassResponse createClass(ClassRequest request) {
        System.out.println("=== DEBUG: ClassService.createClass() ===");
        System.out.println("Request teacherId: " + request.getTeacherId());
        System.out.println("Request data: " + request.toString());
        
        // Validate teacher exists and is a teacher
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        System.out.println("Found teacher: " + teacher.toString());
        System.out.println("Teacher role: '" + teacher.getRole() + "'");
        System.out.println("Teacher role type: " + (teacher.getRole() != null ? teacher.getRole().getClass().getName() : "NULL"));
        System.out.println("Role comparison results:");
        System.out.println("  'TEACHER'.equals(teacher.getRole()): " + "TEACHER".equals(teacher.getRole()));
        System.out.println("  'ADMIN'.equals(teacher.getRole()): " + "ADMIN".equals(teacher.getRole()));
        System.out.println("  teacher.getRole().equals('TEACHER'): " + (teacher.getRole() != null ? teacher.getRole().equals("TEACHER") : "NULL"));
        
        // More robust role validation for UserRole enum
        UserRole userRole = teacher.getRole();
        if (userRole != null) {
            System.out.println("  UserRole enum: " + userRole);
            System.out.println("  UserRole name: '" + userRole.name() + "'");
            System.out.println("  UserRole ordinal: " + userRole.ordinal());
        }
        
        // Check if role is TEACHER or ADMIN using enum comparison
        boolean isTeacher = userRole == UserRole.TEACHER;
        boolean isAdmin = userRole == UserRole.ADMIN;
        
        System.out.println("  isTeacher: " + isTeacher);
        System.out.println("  isAdmin: " + isAdmin);
        
        if (!isTeacher && !isAdmin) {
            System.out.println("=== ROLE VALIDATION FAILED ===");
            System.out.println("Teacher role: " + teacher.getRole());
            System.out.println("Expected: TEACHER or ADMIN");
            throw new RuntimeException("User must be a teacher or admin to create classes");
        }
        
        System.out.println("=== ROLE VALIDATION PASSED ===");
        
        // Check if class name already exists for this teacher
        Optional<Class> existingClass = classRepository.findByClassNameAndTeacherIdAndIsActiveTrue(
                request.getClassName(), request.getTeacherId());
        if (existingClass.isPresent()) {
            throw new RuntimeException("Class with this name already exists for this teacher");
        }
        
        // Create new class
        Class newClass = new Class();
        newClass.setClassName(request.getClassName()); // Maps to class_name field
        newClass.setName(request.getClassName()); // Also set name field
        newClass.setSubject(request.getSubject());
        newClass.setGradeLevel(request.getGradeLevel());
        newClass.setGrade(request.getGradeLevel()); // Set grade field as well
        newClass.setDescription(request.getDescription());
        newClass.setScheduleInfo(request.getScheduleInfo());
        newClass.setRoomNumber(request.getRoomNumber());
        newClass.setAcademicYear(request.getAcademicYear());
        newClass.setSemester(request.getSemester());
        newClass.setMaxStudents(request.getMaxStudents());
        newClass.setTeacher(teacher);
        newClass.setIsActive(true);
        newClass.setCreatedAt(LocalDateTime.now());
        
        Class savedClass = classRepository.save(newClass);
        System.out.println("=== CLASS CREATED SUCCESSFULLY ===");
        return convertToResponse(savedClass);
    }
    
    // Get class by ID
    public ClassResponse getClassById(Long classId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        if (!classEntity.getIsActive()) {
            throw new RuntimeException("Class is not active");
        }
        
        return convertToResponse(classEntity);
    }
    
    // Get all classes for a teacher
    public List<ClassResponse> getClassesByTeacher(Long teacherId) {
        List<Class> classes = classRepository.findByTeacherIdAndIsActiveTrue(teacherId);
        return classes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get all classes for a student
    public List<ClassResponse> getClassesByStudent(Long studentId) {
        List<Class> classes = classRepository.findClassesByStudent(studentId);
        return classes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get all active classes
    public List<ClassResponse> getAllActiveClasses() {
        List<Class> classes = classRepository.findByIsActiveTrue();
        return classes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Search classes
    public List<ClassResponse> searchClasses(String searchTerm) {
        List<Class> classes = classRepository.searchClasses(searchTerm);
        return classes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Update class
    public ClassResponse updateClass(Long classId, ClassRequest request) {
        Class existingClass = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        if (!existingClass.getIsActive()) {
            throw new RuntimeException("Cannot update inactive class");
        }
        
        // Validate teacher exists
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        // Update fields
        existingClass.setClassName(request.getClassName());
        existingClass.setSubject(request.getSubject());
        existingClass.setGradeLevel(request.getGradeLevel());
        existingClass.setDescription(request.getDescription());
        existingClass.setScheduleInfo(request.getScheduleInfo());
        existingClass.setRoomNumber(request.getRoomNumber());
        existingClass.setAcademicYear(request.getAcademicYear());
        existingClass.setSemester(request.getSemester());
        existingClass.setMaxStudents(request.getMaxStudents());
        existingClass.setTeacher(teacher);
        existingClass.setUpdatedAt(LocalDateTime.now());
        
        Class updatedClass = classRepository.save(existingClass);
        return convertToResponse(updatedClass);
    }
    
    // Deactivate class
    public void deactivateClass(Long classId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        classEntity.setIsActive(false);
        classEntity.setUpdatedAt(LocalDateTime.now());
        classRepository.save(classEntity);
    }
    
    // Get class statistics
    public ClassResponse getClassWithStatistics(Long classId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        ClassResponse response = convertToResponse(classEntity);
        
        // Add statistics
        response.setCurrentStudentCount(classEntity.getEnrollments().size());
        response.setTotalAssignments(classEntity.getAssignments().size());
        
        // Get recent assignments
        List<String> recentAssignments = classEntity.getAssignments().stream()
                .limit(5)
                .map(assignment -> assignment.getTitle())
                .collect(Collectors.toList());
        response.setRecentAssignments(recentAssignments);
        
        return response;
    }
    
    // Convert entity to response DTO
    private ClassResponse convertToResponse(Class classEntity) {
        ClassResponse response = new ClassResponse();
        response.setId(classEntity.getId());
        response.setClassName(classEntity.getClassName());
        response.setSubject(classEntity.getSubject());
        response.setGradeLevel(classEntity.getGradeLevel());
        response.setDescription(classEntity.getDescription());
        response.setScheduleInfo(classEntity.getScheduleInfo());
        response.setRoomNumber(classEntity.getRoomNumber());
        response.setAcademicYear(classEntity.getAcademicYear());
        response.setSemester(classEntity.getSemester());
        response.setMaxStudents(classEntity.getMaxStudents());
        response.setIsActive(classEntity.getIsActive());
        response.setCreatedAt(classEntity.getCreatedAt());
        response.setUpdatedAt(classEntity.getUpdatedAt());
        
        // Set teacher information
        if (classEntity.getTeacher() != null) {
            response.setTeacherId(classEntity.getTeacher().getId());
            response.setTeacherName(classEntity.getTeacher().getFirstName() + " " + classEntity.getTeacher().getLastName());
            response.setTeacherEmail(classEntity.getTeacher().getEmail());
        }
        
        return response;
    }
}
