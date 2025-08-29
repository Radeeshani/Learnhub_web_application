package com.homework.service;

import com.homework.entity.Class;
import com.homework.entity.User;
import com.homework.entity.Enrollment;
import com.homework.repository.ClassRepository;
import com.homework.repository.UserRepository;
import com.homework.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClassEnrollmentService {
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    /**
     * Get class IDs where the student is enrolled
     * This uses the actual enrollment table to find enrolled classes
     */
    public List<Long> getStudentEnrolledClassIds(Long studentId) {
        try {
            // First, try to get enrollments from the enrollment table
            List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndStatus(studentId, Enrollment.EnrollmentStatus.ACTIVE);
            
            if (!enrollments.isEmpty()) {
                // Return class IDs from active enrollments
                return enrollments.stream()
                        .map(enrollment -> enrollment.getClassEntity().getId())
                        .collect(Collectors.toList());
            }
            
            // Fallback: If no enrollments found, use class_grade approach
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            String studentGrade = student.getClassGrade();
            if (studentGrade == null || studentGrade.isEmpty()) {
                return List.of();
            }
            
            // Find classes that match the student's grade level
            List<Class> matchingClasses = classRepository.findByGradeLevel(studentGrade);
            return matchingClasses.stream()
                    .map(Class::getId)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            // Log error and return empty list
            System.err.println("Error getting enrolled class IDs for student " + studentId + ": " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Check if a student is enrolled in a specific class
     */
    public boolean isStudentEnrolledInClass(Long studentId, Long classId) {
        List<Long> enrolledClassIds = getStudentEnrolledClassIds(studentId);
        return enrolledClassIds.contains(classId);
    }
}
