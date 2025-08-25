package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_challenges")
public class UserChallenge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;
    
    @Column(nullable = false)
    private Integer progress; // Current progress towards challenge completion
    
    @Column(nullable = false)
    private Integer target; // Target value to complete the challenge
    
    @Column(nullable = false)
    private Boolean isCompleted;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "points_earned")
    private Integer pointsEarned;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public UserChallenge() {
        this.progress = 0;
        this.isCompleted = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public UserChallenge(Long userId, Long challengeId, Integer target) {
        this();
        this.userId = userId;
        this.challengeId = challengeId;
        this.target = target;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getChallengeId() {
        return challengeId;
    }
    
    public void setChallengeId(Long challengeId) {
        this.challengeId = challengeId;
    }
    
    public Integer getProgress() {
        return progress;
    }
    
    public void setProgress(Integer progress) {
        this.progress = progress;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Integer getTarget() {
        return target;
    }
    
    public void setTarget(Integer target) {
        this.target = target;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public Integer getPointsEarned() {
        return pointsEarned;
    }
    
    public void setPointsEarned(Integer pointsEarned) {
        this.pointsEarned = pointsEarned;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Helper methods
    public void incrementProgress() {
        this.progress++;
        this.updatedAt = LocalDateTime.now();
        checkCompletion();
    }
    
    public void addProgress(Integer amount) {
        this.progress += amount;
        this.updatedAt = LocalDateTime.now();
        checkCompletion();
    }
    
    private void checkCompletion() {
        if (this.progress >= this.target && !this.isCompleted) {
            this.isCompleted = true;
            this.completedAt = LocalDateTime.now();
        }
    }
    
    public Double getCompletionPercentage() {
        if (this.target == 0) return 0.0;
        return Math.min(100.0, (this.progress.doubleValue() / this.target.doubleValue()) * 100);
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
