package com.homework.repository;

import com.homework.entity.Homework;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, Long> {
    List<Homework> findByTeacherId(Long teacherId);
    List<Homework> findByClassGrade(String classGrade, Sort sort);
    List<Homework> findByClassGradeAndSubject(String classGrade, String subject, Sort sort);
    List<Homework> findByClassIdIn(List<Long> classIds, Sort sort);
    List<Homework> findByClassIdInAndSubject(List<Long> classIds, String subject, Sort sort);
    List<Homework> findByDueDateAfter(LocalDateTime date);
    
    // Find top 5 homeworks by creation date
    List<Homework> findTop5ByOrderByCreatedAtDesc();
    
    // Count homeworks by teacher
    long countByTeacherId(Long teacherId);
    
    // Count overdue homeworks
    long countByDueDateBefore(LocalDateTime date);
    
    // Count homeworks by class grade
    long countByClassGrade(String classGrade);
    
    // Count homeworks due after a date
    long countByDueDateAfter(LocalDateTime date);
    
    // Custom query to fetch homework data without lazy loading issues
    @Query("SELECT h FROM Homework h " +
           "LEFT JOIN FETCH h.assignedClasses " +
           "WHERE h.teacherId = :teacherId " +
           "ORDER BY h.dueDate DESC")
    List<Homework> findByTeacherIdWithClasses(@Param("teacherId") Long teacherId);
    
    // Count homeworks by class ID
    long countByClassId(Long classId);
    
    // Find top 5 homeworks by class ID ordered by creation date
    List<Homework> findTop5ByClassIdOrderByCreatedAtDesc(Long classId);
    
    // Find homeworks by class ID
    List<Homework> findByClassId(Long classId, Sort sort);
} 