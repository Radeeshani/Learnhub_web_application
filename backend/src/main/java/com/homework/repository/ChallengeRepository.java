package com.homework.repository;

import com.homework.entity.Challenge;
import com.homework.entity.Challenge.ChallengeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    
    List<Challenge> findByIsActiveTrueOrderByStartDateDesc();
    
    List<Challenge> findByTypeAndIsActiveTrue(ChallengeType type);
    
    List<Challenge> findByTypeAndIsActiveTrueAndStartDateBeforeAndEndDateAfter(
        ChallengeType type, LocalDateTime now, LocalDateTime now2);
    
    @Query("SELECT c FROM Challenge c WHERE c.isActive = true AND c.startDate <= :now AND c.endDate >= :now ORDER BY c.type, c.startDate")
    List<Challenge> findActiveChallenges(@Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Challenge c WHERE c.isActive = true AND c.type = :type AND c.startDate <= :now AND c.endDate >= :now")
    List<Challenge> findActiveChallengesByType(@Param("type") ChallengeType type, @Param("now") LocalDateTime now);
    
    List<Challenge> findByIsActiveTrueAndStartDateBetween(LocalDateTime start, LocalDateTime end);
}
