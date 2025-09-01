package com.homework.repository;

import com.homework.entity.User;
import com.homework.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByClassGrade(String classGrade);
    
    /**
     * Find students by class grade with flexible matching
     * Handles both "Grade X" and "Xth Grade" formats
     */
    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' AND (" +
           "u.classGrade = :classGrade OR " +
           "u.classGrade = :alternativeFormat OR " +
           "u.classGrade = :alternativeFormat2)")
    List<User> findStudentsByClassGradeFlexible(@Param("classGrade") String classGrade,
                                               @Param("alternativeFormat") String alternativeFormat,
                                               @Param("alternativeFormat2") String alternativeFormat2);
    
    // Find top 10 users by creation date
    List<User> findTop10ByOrderByCreatedAtDesc();
    
    // Count users by role
    long countByRole(UserRole role);
    
    // Count active users (activity in last 30 days)
    long countByLastActivityDateAfter(LocalDateTime date);
    
    // Find inactive users (no activity in last 30 days)
    List<User> findByLastActivityDateBefore(LocalDateTime date);
    
    // Find students by role and class grade
    List<User> findByRoleAndClassGrade(UserRole role, String classGrade);
} 