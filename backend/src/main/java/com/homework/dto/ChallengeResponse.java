package com.homework.dto;

import com.homework.entity.Challenge.ChallengeType;
import java.time.LocalDateTime;

public class ChallengeResponse {
    private Long id;
    private String title;
    private String description;
    private ChallengeType type;
    private Integer pointsReward;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String criteria;
    private String rewardIcon;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer userProgress;
    private Integer target;
    private Boolean isCompleted;
    private Double completionPercentage;
    
    // Constructors
    public ChallengeResponse() {}
    
    public ChallengeResponse(Long id, String title, String description, ChallengeType type, 
                           Integer pointsReward, LocalDateTime startDate, LocalDateTime endDate, 
                           String criteria, String rewardIcon, Boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.pointsReward = pointsReward;
        this.startDate = startDate;
        this.endDate = endDate;
        this.criteria = criteria;
        this.rewardIcon = rewardIcon;
        this.isActive = isActive;
        this.createdAt = createdAt;
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
    
    public Integer getUserProgress() {
        return userProgress;
    }
    
    public void setUserProgress(Integer userProgress) {
        this.userProgress = userProgress;
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
    }
    
    public Double getCompletionPercentage() {
        return completionPercentage;
    }
    
    public void setCompletionPercentage(Double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }
}
