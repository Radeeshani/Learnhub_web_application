package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
public class Assignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "assignment_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private AssignmentType assignmentType;
    
    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;
    
    @Column(name = "assigned_date", nullable = false)
    private LocalDateTime assignedDate;
    
    @Column(name = "max_points")
    private Integer maxPoints;
    
    @Column(name = "weight_percentage")
    private Double weightPercentage;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "allow_late_submission")
    private Boolean allowLateSubmission = false;
    
    @Column(name = "late_submission_penalty")
    private Double lateSubmissionPenalty = 0.0; // Percentage penalty
    
    @Column(name = "attachments_info")
    private String attachmentsInfo; // JSON string or comma-separated file names
    
    @Column(name = "submission_instructions", columnDefinition = "TEXT")
    private String submissionInstructions;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class classEntity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    // Constructors
    public Assignment() {
        this.createdAt = LocalDateTime.now();
        this.assignedDate = LocalDateTime.now();
    }
    
    public Assignment(String title, String description, AssignmentType assignmentType, LocalDateTime dueDate) {
        this();
        this.title = title;
        this.description = description;
        this.assignmentType = assignmentType;
        this.dueDate = dueDate;
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
    
    public AssignmentType getAssignmentType() {
        return assignmentType;
    }
    
    public void setAssignmentType(AssignmentType assignmentType) {
        this.assignmentType = assignmentType;
    }
    
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
    
    public LocalDateTime getAssignedDate() {
        return assignedDate;
    }
    
    public void setAssignedDate(LocalDateTime assignedDate) {
        this.assignedDate = assignedDate;
    }
    
    public Integer getMaxPoints() {
        return maxPoints;
    }
    
    public void setMaxPoints(Integer maxPoints) {
        this.maxPoints = maxPoints;
    }
    
    public Double getWeightPercentage() {
        return weightPercentage;
    }
    
    public void setWeightPercentage(Double weightPercentage) {
        this.weightPercentage = weightPercentage;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getAllowLateSubmission() {
        return allowLateSubmission;
    }
    
    public void setAllowLateSubmission(Boolean allowLateSubmission) {
        this.allowLateSubmission = allowLateSubmission;
    }
    
    public Double getLateSubmissionPenalty() {
        return lateSubmissionPenalty;
    }
    
    public void setLateSubmissionPenalty(Double lateSubmissionPenalty) {
        this.lateSubmissionPenalty = lateSubmissionPenalty;
    }
    
    public String getAttachmentsInfo() {
        return attachmentsInfo;
    }
    
    public void setAttachmentsInfo(String attachmentsInfo) {
        this.attachmentsInfo = attachmentsInfo;
    }
    
    public String getSubmissionInstructions() {
        return submissionInstructions;
    }
    
    public void setSubmissionInstructions(String submissionInstructions) {
        this.submissionInstructions = submissionInstructions;
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
    
    public Class getClassEntity() {
        return classEntity;
    }
    
    public void setClassEntity(Class classEntity) {
        this.classEntity = classEntity;
    }
    
    public User getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Assignment{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", assignmentType=" + assignmentType +
                ", dueDate=" + dueDate +
                ", classEntity=" + (classEntity != null ? classEntity.getId() : "null") +
                '}';
    }
    
    public enum AssignmentType {
        HOMEWORK, QUIZ, EXAM, PROJECT, ESSAY, PRESENTATION, LAB_REPORT, DISCUSSION, PARTICIPATION
    }
}
