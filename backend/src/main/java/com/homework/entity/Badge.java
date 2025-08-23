package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
public class Badge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private String iconUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BadgeType type;
    
    @Column(nullable = false)
    private Integer pointsRequired;
    
    @Column(nullable = false)
    private String color;
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum BadgeType {
        HOMEWORK_COMPLETION,
        ON_TIME_SUBMISSION,
        PERFECT_SCORE,
        STREAK,
        SUBJECT_MASTERY,
        HELPING_OTHERS,
        CREATIVITY,
        CONSISTENCY
    }
    
    // Constructors
    public Badge() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }
    
    public Badge(String name, String description, String iconUrl, BadgeType type, Integer pointsRequired, String color) {
        this();
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
        this.type = type;
        this.pointsRequired = pointsRequired;
        this.color = color;
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIconUrl() {
        return iconUrl;
    }
    
    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }
    
    public BadgeType getType() {
        return type;
    }
    
    public void setType(BadgeType type) {
        this.type = type;
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
