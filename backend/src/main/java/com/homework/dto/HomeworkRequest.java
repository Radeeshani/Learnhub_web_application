package com.homework.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class HomeworkRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Class grade is required")
    private String classGrade;
    
    @NotNull(message = "Grade is required")
    private Integer grade;
    
    @NotNull(message = "Class is required")
    private Long classId;
    
    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;
    
    private String audioFileName;
    private String audioFileUrl;
    
    // Getters and Setters
    
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
    
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
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
} 