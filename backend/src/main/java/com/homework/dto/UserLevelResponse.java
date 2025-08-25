package com.homework.dto;

import java.time.LocalDateTime;

public class UserLevelResponse {
    private Long id;
    private String name;
    private Integer levelNumber;
    private Integer pointsRequired;
    private String color;
    private String specialPrivileges;
    private String levelUpAnimation;
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    // Constructors
    public UserLevelResponse() {}
    
    public UserLevelResponse(Long id, String name, Integer levelNumber, Integer pointsRequired, 
                           String color, String specialPrivileges, String levelUpAnimation, 
                           Boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.levelNumber = levelNumber;
        this.pointsRequired = pointsRequired;
        this.color = color;
        this.specialPrivileges = specialPrivileges;
        this.levelUpAnimation = levelUpAnimation;
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
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getLevelNumber() {
        return levelNumber;
    }
    
    public void setLevelNumber(Integer levelNumber) {
        this.levelNumber = levelNumber;
    }
    
    public Integer getPointsRequired() {
        return pointsRequired;
    }
    
    public void setPointsRequired(Integer pointsRequired) {
        this.pointsRequired = pointsRequired;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getSpecialPrivileges() {
        return specialPrivileges;
    }
    
    public void setSpecialPrivileges(String specialPrivileges) {
        this.specialPrivileges = specialPrivileges;
    }
    
    public String getLevelUpAnimation() {
        return levelUpAnimation;
    }
    
    public void setLevelUpAnimation(String levelUpAnimation) {
        this.levelUpAnimation = levelUpAnimation;
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
}
