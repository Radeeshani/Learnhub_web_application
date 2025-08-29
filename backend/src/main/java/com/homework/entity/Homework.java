package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "homeworks")
public class Homework {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(name = "class_grade", nullable = false)
    private String classGrade;
    
    @Column(name = "grade", nullable = false)
    private Integer grade;
    
    @Column(name = "class_id", nullable = false)
    private Long classId;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_url")
    private String fileUrl;
    
    @Column(name = "audio_file_name")
    private String audioFileName;
    
    @Column(name = "audio_file_url")
    private String audioFileUrl;
    
    @Column(name = "teacher_id")
    private Long teacherId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Many-to-many relationship with classes
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "homework_class_assignments",
        joinColumns = @JoinColumn(name = "homework_id"),
        inverseJoinColumns = @JoinColumn(name = "class_id")
    )
    private Set<Class> assignedClasses = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getClassGrade() {
        return classGrade;
    }
    
    public void setClassGrade(String classGrade) {
        this.classGrade = classGrade;
    }
    
    public Integer getGrade() {
        return grade;
    }
    
    public void setGrade(Integer grade) {
        this.grade = grade;
    }
    
    public Long getClassId() {
        return classId;
    }
    
    public void setClassId(Long classId) {
        this.classId = classId;
    }
    
    public Set<Class> getAssignedClasses() {
        return assignedClasses;
    }
    
    public void setAssignedClasses(Set<Class> assignedClasses) {
        this.assignedClasses = assignedClasses;
    }
    
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getFileUrl() {
        return fileUrl;
    }
    
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public String getAudioFileName() {
        return audioFileName;
    }
    
    public void setAudioFileName(String audioFileName) {
        this.audioFileName = audioFileName;
    }
    
    public String getAudioFileUrl() {
        return audioFileUrl;
    }
    
    public void setAudioFileUrl(String audioFileUrl) {
        this.audioFileUrl = audioFileUrl;
    }
    
    public Long getTeacherId() {
        return teacherId;
    }
    
    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
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
} 