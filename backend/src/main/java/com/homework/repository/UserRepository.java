package com.homework.repository;

import com.homework.entity.User;
import com.homework.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByClassGrade(String classGrade);
    
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