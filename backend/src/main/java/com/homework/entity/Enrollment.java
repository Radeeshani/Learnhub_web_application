package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class classEntity;
    
    @Column(name = "enrollment_date", nullable = false)
    private LocalDateTime enrollmentDate;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;
    
    @Column(name = "grade")
    private String grade;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Enrollment() {
        this.createdAt = LocalDateTime.now();
        this.enrollmentDate = LocalDateTime.now();
    }
    
    public Enrollment(User student, Class classEntity) {
        this();
        this.student = student;
        this.classEntity = classEntity;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getStudent() {
        return student;
    }
    
    public void setStudent(User student) {
        this.student = student;
    }
    
    public Class getClassEntity() {
        return classEntity;
    }
    
    public void setClassEntity(Class classEntity) {
        this.classEntity = classEntity;
    }
    
    public LocalDateTime getEnrollmentDate() {
        return enrollmentDate;
    }
    
    public void setEnrollmentDate(LocalDateTime enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }
    
    public EnrollmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }
    
    public String getGrade() {
        return grade;
    }
    
    public void setGrade(String grade) {
        this.grade = grade;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Enrollment{" +
                "id=" + id +
                ", student=" + (student != null ? student.getId() : "null") +
                ", classEntity=" + (classEntity != null ? classEntity.getId() : "null") +
                ", status=" + status +
                '}';
    }
    
    public enum EnrollmentStatus {
        ACTIVE, INACTIVE, DROPPED, COMPLETED
    }
}
