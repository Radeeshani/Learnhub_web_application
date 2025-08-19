package com.homework.repository;

import com.homework.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    
    // Find classes by teacher
    List<Class> findByTeacherIdAndIsActiveTrue(Long teacherId);
    
    // Find classes by subject
    List<Class> findBySubjectAndIsActiveTrue(String subject);
    
    // Find classes by grade level
    List<Class> findByGradeLevelAndIsActiveTrue(String gradeLevel);
    
    // Find classes by academic year and semester
    List<Class> findByAcademicYearAndSemesterAndIsActiveTrue(String academicYear, String semester);
    
    // Find active classes
    List<Class> findByIsActiveTrue();
    
    // Find classes by teacher with student count
    @Query("SELECT c, COUNT(e) as studentCount FROM Class c LEFT JOIN c.enrollments e WHERE c.teacher.id = :teacherId AND c.isActive = true AND (e.status = 'ACTIVE' OR e IS NULL) GROUP BY c")
    List<Object[]> findClassesByTeacherWithStudentCount(@Param("teacherId") Long teacherId);
    
    // Find classes by student (through enrollments)
    @Query("SELECT DISTINCT c FROM Class c JOIN c.enrollments e WHERE e.student.id = :studentId AND e.status = 'ACTIVE' AND c.isActive = true")
    List<Class> findClassesByStudent(@Param("studentId") Long studentId);
    
    // Find class by name and teacher
    Optional<Class> findByClassNameAndTeacherIdAndIsActiveTrue(String className, Long teacherId);
    
    // Search classes by name or subject
    @Query("SELECT c FROM Class c WHERE c.isActive = true AND (LOWER(c.className) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Class> searchClasses(@Param("searchTerm") String searchTerm);
    
    // Count active classes by teacher
    long countByTeacherIdAndIsActiveTrue(Long teacherId);
    
    // Count active classes by grade level
    long countByGradeLevelAndIsActiveTrue(String gradeLevel);
}
