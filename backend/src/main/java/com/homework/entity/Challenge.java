package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "challenges")
public class Challenge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title; // "Weekend Warrior", "Perfect Week"
    
    @Column(nullable = false, length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChallengeType type; // DAILY, WEEKLY, MONTHLY, SPECIAL_EVENT
    
    @Column(nullable = false)
    private Integer pointsReward;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @Column(nullable = false)
    private String criteria; // JSON string: "Complete 5 homeworks", "Get 3 perfect scores"
    
    @Column(nullable = false)
    private String rewardIcon;
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum ChallengeType {
        DAILY,
        WEEKLY,
        MONTHLY,
        SPECIAL_EVENT
    }
    
    // Constructors
    public Challenge() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }
    
    public Challenge(String title, String description, ChallengeType type, Integer pointsReward,
                   LocalDateTime startDate, LocalDateTime endDate, String criteria, String rewardIcon) {
        this();
        this.title = title;
        this.description = description;
        this.type = type;
        this.pointsReward = pointsReward;
        this.startDate = startDate;
        this.endDate = endDate;
        this.criteria = criteria;
        this.rewardIcon = rewardIcon;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public ChallengeType getType() {
        return type;
    }
    
    public void setType(ChallengeType type) {
        this.type = type;
    }
    
    public Integer getPointsReward() {
        return pointsReward;
    }
    
    public void setPointsReward(Integer pointsReward) {
        this.pointsReward = pointsReward;
    }
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
    
    public String getCriteria() {
        return criteria;
    }
    
    public void setCriteria(String criteria) {
        this.criteria = criteria;
    }
    
    public String getRewardIcon() {
        return rewardIcon;
    }
    
    public void setRewardIcon(String rewardIcon) {
        this.rewardIcon = rewardIcon;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
