package com.homework.repository;

import com.homework.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    
    /**
     * Find user progress by user ID
     */
    Optional<UserProgress> findByUserId(Long userId);
    
    /**
     * Find top users by total points (leaderboard)
     */
    @Query("SELECT up FROM UserProgress up ORDER BY up.totalPoints DESC")
    List<UserProgress> findTopByOrderByTotalPointsDesc(int limit);
    
    /**
     * Find users by minimum points
     */
    List<UserProgress> findByTotalPointsGreaterThanEqual(Integer minPoints);
    
    /**
     * Find users by streak range
     */
    List<UserProgress> findByCurrentStreakBetween(Integer minStreak, Integer maxStreak);
}
