package com.homework.dto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

import com.homework.entity.Homework;
import com.homework.entity.Class;

public class StudentHomeworkResponse {
    private Long id;
    private String title;
    private String description;
    private String subject;
    private String classGrade;
    private Long classId;
    private LocalDateTime dueDate;
    private String fileName;
    private String fileUrl;
    private String audioFileName;
    private String audioFileUrl;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<String> assignedClassNames;
    private boolean isSubmitted;
    private String submissionStatus;

    public StudentHomeworkResponse() {}

    public StudentHomeworkResponse(Homework homework) {
        this.id = homework.getId();
        this.title = homework.getTitle();
        this.description = homework.getDescription();
        this.subject = homework.getSubject();
        this.classGrade = homework.getClassGrade();
        this.classId = homework.getClassId();
        this.dueDate = homework.getDueDate();
        this.fileName = homework.getFileName();
        this.fileUrl = homework.getFileUrl();
        this.audioFileName = homework.getAudioFileName();
        this.audioFileUrl = homework.getAudioFileUrl();
        this.teacherId = homework.getTeacherId();
        this.createdAt = homework.getCreatedAt();
        this.updatedAt = homework.getUpdatedAt();
        
        // Convert assigned classes to class names to avoid lazy loading issues
        if (homework.getAssignedClasses() != null) {
            this.assignedClassNames = homework.getAssignedClasses().stream()
                .map(Class::getClassName)
                .collect(Collectors.toSet());
        }
        
        // Default values for student-specific fields
        this.isSubmitted = false;
        this.submissionStatus = "Not Submitted";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getClassGrade() { return classGrade; }
    public void setClassGrade(String classGrade) { this.classGrade = classGrade; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getAudioFileName() { return audioFileName; }
    public void setAudioFileName(String audioFileName) { this.audioFileName = audioFileName; }

    public String getAudioFileUrl() { return audioFileUrl; }
    public void setAudioFileUrl(String audioFileUrl) { this.audioFileUrl = audioFileUrl; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Set<String> getAssignedClassNames() { return assignedClassNames; }
    public void setAssignedClassNames(Set<String> assignedClassNames) { this.assignedClassNames = assignedClassNames; }

    public boolean isSubmitted() { return isSubmitted; }
    public void setSubmitted(boolean submitted) { isSubmitted = submitted; }

    public String getSubmissionStatus() { return submissionStatus; }
    public void setSubmissionStatus(String submissionStatus) { this.submissionStatus = submissionStatus; }
}
