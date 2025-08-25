package com.homework.repository;

import com.homework.entity.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    
    List<UserLevel> findByIsActiveTrueOrderByLevelNumberAsc();
    
    Optional<UserLevel> findByLevelNumber(Integer levelNumber);
    
    Optional<UserLevel> findByLevelNumberAndIsActiveTrue(Integer levelNumber);
    
    @Query("SELECT ul FROM UserLevel ul WHERE ul.pointsRequired <= :userPoints AND ul.isActive = true ORDER BY ul.levelNumber DESC")
    List<UserLevel> findAvailableLevelsForPoints(@Param("userPoints") Integer userPoints);
    
    @Query("SELECT ul FROM UserLevel ul WHERE ul.pointsRequired > :userPoints AND ul.isActive = true ORDER BY ul.pointsRequired ASC LIMIT 1")
    Optional<UserLevel> findNextLevel(@Param("userPoints") Integer userPoints);
    
    @Query("SELECT ul FROM UserLevel ul WHERE ul.pointsRequired <= :userPoints AND ul.isActive = true ORDER BY ul.levelNumber DESC LIMIT 1")
    Optional<UserLevel> findCurrentLevel(@Param("userPoints") Integer userPoints);
}
