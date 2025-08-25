package com.homework.repository;

import com.homework.entity.UserChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {
    
    List<UserChallenge> findByUserId(Long userId);
    
    List<UserChallenge> findByUserIdAndIsCompletedTrue(Long userId);
    
    List<UserChallenge> findByUserIdAndIsCompletedFalse(Long userId);
    
    Optional<UserChallenge> findByUserIdAndChallengeId(Long userId, Long challengeId);
    
    @Query("SELECT uc FROM UserChallenge uc WHERE uc.userId = :userId AND uc.challengeId = :challengeId")
    Optional<UserChallenge> findUserChallenge(@Param("userId") Long userId, @Param("challengeId") Long challengeId);
    
    @Query("SELECT COUNT(uc) FROM UserChallenge uc WHERE uc.userId = :userId AND uc.isCompleted = true")
    Long countCompletedChallengesByUserId(@Param("userId") Long userId);
    
    @Query("SELECT uc FROM UserChallenge uc WHERE uc.userId = :userId AND uc.isCompleted = false ORDER BY uc.updatedAt DESC")
    List<UserChallenge> findActiveChallengesByUserId(@Param("userId") Long userId);
}
