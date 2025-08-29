package com.homework.repository;

import com.homework.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    // Find reports by teacher
    List<Report> findByTeacherId(Long teacherId);
    
    // Find reports by student
    List<Report> findByStudentId(Long studentId);
    
    // Find reports by class
    List<Report> findByClassId(Long classId);
    
    // Find reports by teacher and class
    List<Report> findByTeacherIdAndClassId(Long teacherId, Long classId);
    

    
    // Find reports by teacher and student
    List<Report> findByTeacherIdAndStudentId(Long teacherId, Long studentId);
    

    
    // Find latest report for a student in a specific class
    @Query("SELECT r FROM Report r WHERE r.studentId = :studentId AND r.classId = :classId ORDER BY r.reportDate DESC")
    List<Report> findLatestReportsByStudentAndClass(@Param("studentId") Long studentId, @Param("classId") Long classId);
    

    
    // Check if report exists for student in class
    boolean existsByStudentIdAndClassId(Long studentId, Long classId);
    

    
    // Count reports by teacher
    long countByTeacherId(Long teacherId);
    
    // Count reports by student
    long countByStudentId(Long studentId);
    

}
