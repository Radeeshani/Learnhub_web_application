package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    
    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;
    
    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak;
    
    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak;
    
    @Column(name = "homework_completed", nullable = false)
    private Integer homeworkCompleted;
    
    @Column(name = "on_time_submissions", nullable = false)
    private Integer onTimeSubmissions;
    
    @Column(name = "perfect_scores", nullable = false)
    private Integer perfectScores;
    
    @Column(name = "total_submissions", nullable = false)
    private Integer totalSubmissions;
    
    @Column(name = "current_level", nullable = false)
    private Integer currentLevel;
    
    @Column(name = "experience_points", nullable = false)
    private Integer experiencePoints;
    
    @Column(name = "last_submission_date")
    private LocalDateTime lastSubmissionDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_badges",
        joinColumns = @JoinColumn(name = "user_progress_id"),
        inverseJoinColumns = @JoinColumn(name = "badge_id")
    )
    private Set<Badge> earnedBadges;
    
    // Constructors
    public UserProgress() {
        this.totalPoints = 0;
        this.currentStreak = 0;
        this.longestStreak = 0;
        this.homeworkCompleted = 0;
        this.onTimeSubmissions = 0;
        this.perfectScores = 0;
        this.totalSubmissions = 0;
        this.currentLevel = 1;
        this.experiencePoints = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.earnedBadges = new java.util.HashSet<>();
    }
    
    public UserProgress(User user) {
        this();
        this.userId = user.getId();
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
    
    public Integer getTotalPoints() {
        return totalPoints;
    }
    
    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }
    
    public Integer getCurrentStreak() {
        return currentStreak;
    }
    
    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }
    
    public Integer getLongestStreak() {
        return longestStreak;
    }
    
    public void setLongestStreak(Integer longestStreak) {
        this.longestStreak = longestStreak;
    }
    
    public Integer getHomeworkCompleted() {
        return homeworkCompleted;
    }
    
    public void setHomeworkCompleted(Integer homeworkCompleted) {
        this.homeworkCompleted = homeworkCompleted;
    }
    
    public Integer getOnTimeSubmissions() {
        return onTimeSubmissions;
    }
    
    public void setOnTimeSubmissions(Integer onTimeSubmissions) {
        this.onTimeSubmissions = onTimeSubmissions;
    }
    
    public Integer getPerfectScores() {
        return perfectScores;
    }
    
    public void setPerfectScores(Integer perfectScores) {
        this.perfectScores = perfectScores;
    }
    
    public Integer getTotalSubmissions() {
        return totalSubmissions;
    }
    
    public void setTotalSubmissions(Integer totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }
    
    public Integer getCurrentLevel() {
        return currentLevel;
    }
    
    public void setCurrentLevel(Integer currentLevel) {
        this.currentLevel = currentLevel;
    }
    
    public Integer getExperiencePoints() {
        return experiencePoints;
    }
    
    public void setExperiencePoints(Integer experiencePoints) {
        this.experiencePoints = experiencePoints;
    }
    
    public LocalDateTime getLastSubmissionDate() {
        return lastSubmissionDate;
    }
    
    public void setLastSubmissionDate(LocalDateTime lastSubmissionDate) {
        this.lastSubmissionDate = lastSubmissionDate;
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
    
    public Set<Badge> getEarnedBadges() {
        return earnedBadges;
    }
    
    public void setEarnedBadges(Set<Badge> earnedBadges) {
        this.earnedBadges = earnedBadges;
    }
    
    // Helper methods
    public void addPoints(Integer points) {
        this.totalPoints += points;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementHomeworkCompleted() {
        this.homeworkCompleted++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementOnTimeSubmission() {
        this.onTimeSubmissions++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementPerfectScore() {
        this.perfectScores++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementTotalSubmissions() {
        this.totalSubmissions++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateStreak(Integer newStreak) {
        this.currentStreak = newStreak;
        if (newStreak > this.longestStreak) {
            this.longestStreak = newStreak;
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addExperiencePoints(Integer points) {
        this.experiencePoints += points;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void levelUp() {
        this.currentLevel++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Boolean canLevelUp(Integer requiredExperience) {
        return this.experiencePoints >= requiredExperience;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
