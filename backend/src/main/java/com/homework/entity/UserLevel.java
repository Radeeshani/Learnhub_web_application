package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_levels")
public class UserLevel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name; // "Novice", "Apprentice", "Scholar", "Master", "Grandmaster"
    
    @Column(name = "level_number", nullable = false, unique = true)
    private Integer levelNumber; // 1, 2, 3, 4, 5
    
    @Column(name = "points_required", nullable = false)
    private Integer pointsRequired; // 0, 100, 500, 1000, 2500
    
    @Column(nullable = false)
    private String color; // Bronze, Silver, Gold, Platinum, Diamond
    
    @Column(name = "special_privileges", nullable = false)
    private String specialPrivileges; // "Can create study groups", "Access to premium content"
    
    @Column(name = "level_up_animation", nullable = false)
    private String levelUpAnimation; // Custom animation for level up
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public UserLevel() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }
    
    public UserLevel(String name, Integer levelNumber, Integer pointsRequired, String color, 
                    String specialPrivileges, String levelUpAnimation) {
        this();
        this.name = name;
        this.levelNumber = levelNumber;
        this.pointsRequired = pointsRequired;
        this.color = color;
        this.specialPrivileges = specialPrivileges;
        this.levelUpAnimation = levelUpAnimation;
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
