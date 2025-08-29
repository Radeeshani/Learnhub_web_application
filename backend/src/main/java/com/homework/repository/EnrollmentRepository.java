package com.homework.repository;

import com.homework.entity.Enrollment;
import com.homework.entity.Enrollment.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    // Find enrollments by class
    List<Enrollment> findByClassEntityId(Long classId);
    
    // Find enrollments by class and status
    List<Enrollment> findByClassEntityIdAndStatus(Long classId, EnrollmentStatus status);
    
    // Find enrollments by student
    List<Enrollment> findByStudentId(Long studentId);
    
    // Find enrollments by student and status
    List<Enrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);
    
    // Find enrollment by student and class
    Optional<Enrollment> findByStudentIdAndClassEntityId(Long studentId, Long classId);
    
    // Check if student is enrolled in class
    boolean existsByStudentIdAndClassEntityId(Long studentId, Long classId);
    
    // Count enrollments by class and status
    long countByClassEntityIdAndStatus(Long classId, EnrollmentStatus status);
    
    // Count enrollments by student and status
    long countByStudentIdAndStatus(Long studentId, EnrollmentStatus status);
    
    // Find active enrollments by class
    @Query("SELECT e FROM Enrollment e WHERE e.classEntity.id = :classId AND e.status = 'ACTIVE'")
    List<Enrollment> findActiveEnrollmentsByClass(@Param("classId") Long classId);
    
    // Find active enrollments by student
    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'ACTIVE'")
    List<Enrollment> findActiveEnrollmentsByStudent(@Param("studentId") Long studentId);
}
