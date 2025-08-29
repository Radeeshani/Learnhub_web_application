package com.homework.repository;

import com.homework.entity.HomeworkSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, Long> {
    
    List<HomeworkSubmission> findByHomeworkId(Long homeworkId);
    
    List<HomeworkSubmission> findByStudentId(Long studentId);
    
    Optional<HomeworkSubmission> findByHomeworkIdAndStudentId(Long homeworkId, Long studentId);
    
    boolean existsByHomeworkIdAndStudentId(Long homeworkId, Long studentId);
    
    @Query("SELECT hs FROM HomeworkSubmission hs WHERE hs.homeworkId = :homeworkId AND hs.status = :status")
    List<HomeworkSubmission> findByHomeworkIdAndStatus(@Param("homeworkId") Long homeworkId, @Param("status") HomeworkSubmission.SubmissionStatus status);
    
    @Query("SELECT COUNT(hs) FROM HomeworkSubmission hs WHERE hs.homeworkId = :homeworkId")
    long countByHomeworkId(@Param("homeworkId") Long homeworkId);
    
    @Query("SELECT COUNT(hs) FROM HomeworkSubmission hs WHERE hs.homeworkId = :homeworkId AND hs.status = 'GRADED'")
    long countGradedByHomeworkId(@Param("homeworkId") Long homeworkId);
    
    @Query("SELECT hs FROM HomeworkSubmission hs WHERE hs.studentId = :studentId AND hs.status = :status")
    List<HomeworkSubmission> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") HomeworkSubmission.SubmissionStatus status);
    
    // Find top 5 submissions by submission date
    List<HomeworkSubmission> findTop5ByOrderBySubmittedAtDesc();
    
    // Count submissions by student
    long countByStudentId(Long studentId);
    
    // Count submissions by status
    long countByStatus(HomeworkSubmission.SubmissionStatus status);
    
    // Count graded submissions by student
    long countByStudentIdAndStatus(Long studentId, HomeworkSubmission.SubmissionStatus status);
}
