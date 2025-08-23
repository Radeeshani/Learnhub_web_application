package com.homework.repository;

import com.homework.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    
    /**
     * Find all active badges
     */
    List<Badge> findByIsActiveTrue();
    
    /**
     * Find badges by type
     */
    List<Badge> findByType(Badge.BadgeType type);
    
    /**
     * Find badges by points required (less than or equal to)
     */
    List<Badge> findByPointsRequiredLessThanEqual(Integer points);
}
