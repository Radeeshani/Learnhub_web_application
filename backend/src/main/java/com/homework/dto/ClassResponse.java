package com.homework.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ClassResponse {
    
    private Long id;
    private String className;
    private String subject;
    private String gradeLevel;
    private String description;
    private String scheduleInfo;
    private String roomNumber;
    private String academicYear;
    private String semester;
    private Integer maxStudents;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Teacher information
    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
    
    // Statistics
    private Integer currentStudentCount;
    private Integer totalAssignments;
    private List<String> recentAssignments;
    
    // Constructors
    public ClassResponse() {}
    
    public ClassResponse(Long id, String className, String subject, String gradeLevel) {
        this.id = id;
        this.className = className;
        this.subject = subject;
        this.gradeLevel = gradeLevel;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public Long getTeacherId() {
        return teacherId;
    }
    
    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }
    
    public String getTeacherName() {
        return teacherName;
    }
    
    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
    
    public String getTeacherEmail() {
        return teacherEmail;
    }
    
    public void setTeacherEmail(String teacherEmail) {
        this.teacherEmail = teacherEmail;
    }
    
    public Integer getCurrentStudentCount() {
        return currentStudentCount;
    }
    
    public void setCurrentStudentCount(Integer currentStudentCount) {
        this.currentStudentCount = currentStudentCount;
    }
    
    public Integer getTotalAssignments() {
        return totalAssignments;
    }
    
    public void setTotalAssignments(Integer totalAssignments) {
        this.totalAssignments = totalAssignments;
    }
    
    public List<String> getRecentAssignments() {
        return recentAssignments;
    }
    
    public void setRecentAssignments(List<String> recentAssignments) {
        this.recentAssignments = recentAssignments;
    }
    
    @Override
    public String toString() {
        return "ClassResponse{" +
                "id=" + id +
                ", className='" + className + '\'' +
                ", subject='" + subject + '\'' +
                ", gradeLevel='" + gradeLevel + '\'' +
                ", teacherName='" + teacherName + '\'' +
                ", currentStudentCount=" + currentStudentCount +
                '}';
    }
}
