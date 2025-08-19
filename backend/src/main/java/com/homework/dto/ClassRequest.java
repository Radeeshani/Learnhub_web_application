package com.homework.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ClassRequest {
    
    @NotBlank(message = "Class name is required")
    @Size(max = 255, message = "Class name cannot exceed 255 characters")
    private String className;
    
    @NotBlank(message = "Subject is required")
    @Size(max = 255, message = "Subject cannot exceed 255 characters")
    private String subject;
    
    @Size(max = 50, message = "Grade level cannot exceed 50 characters")
    private String gradeLevel;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @Size(max = 500, message = "Schedule info cannot exceed 500 characters")
    private String scheduleInfo;
    
    @Size(max = 50, message = "Room number cannot exceed 50 characters")
    private String roomNumber;
    
    @Size(max = 20, message = "Academic year cannot exceed 20 characters")
    private String academicYear;
    
    @Size(max = 20, message = "Semester cannot exceed 20 characters")
    private String semester;
    
    private Integer maxStudents;
    
    @NotNull(message = "Teacher ID is required")
    private Long teacherId;
    
    // Constructors
    public ClassRequest() {}
    
    public ClassRequest(String className, String subject, String gradeLevel, Long teacherId) {
        this.className = className;
        this.subject = subject;
        this.gradeLevel = gradeLevel;
        this.teacherId = teacherId;
    }
    
    // Getters and Setters
    public String getClassName() {
        return className;
    }
    
    public void setClassName(String className) {
        this.className = className;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getGradeLevel() {
        return gradeLevel;
    }
    
    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getScheduleInfo() {
        return scheduleInfo;
    }
    
    public void setScheduleInfo(String scheduleInfo) {
        this.scheduleInfo = scheduleInfo;
    }
    
    public String getRoomNumber() {
        return roomNumber;
    }
    
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
    
    public String getAcademicYear() {
        return academicYear;
    }
    
    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }
    
    public String getSemester() {
        return semester;
    }
    
    public void setSemester(String semester) {
        this.semester = semester;
    }
    
    public Integer getMaxStudents() {
        return maxStudents;
    }
    
    public void setMaxStudents(Integer maxStudents) {
        this.maxStudents = maxStudents;
    }
    
    public Long getTeacherId() {
        return teacherId;
    }
    
    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }
    
    @Override
    public String toString() {
        return "ClassRequest{" +
                "className='" + className + '\'' +
                ", subject='" + subject + '\'' +
                ", gradeLevel='" + gradeLevel + '\'' +
                ", teacherId=" + teacherId +
                '}';
    }
}
