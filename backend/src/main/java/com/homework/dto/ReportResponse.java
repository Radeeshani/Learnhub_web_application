package com.homework.dto;

import com.homework.entity.Report;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ReportResponse {
    
    private Long id;
    private String title;
    private String description;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long teacherId;
    private String teacherName;
    private Long classId;
    private String className;
    private String subject;
    private String gradeLevel;
    private LocalDateTime reportDate;
    private String reportDateFormatted;
    private String overallGrade;
    private Double homeworkCompletionRate;
    private Double averageScore;
    private Integer totalHomeworksAssigned;
    private Integer totalHomeworksCompleted;
    private Integer onTimeSubmissions;
    private Integer lateSubmissions;
    private String strengths;
    private String areasForImprovement;
    private String teacherNotes;
    private String recommendations;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public ReportResponse() {}
    
    public ReportResponse(Report report) {
        this.id = report.getId();
        this.title = report.getTitle();
        this.description = report.getDescription();
        this.studentId = report.getStudentId();
        this.teacherId = report.getTeacherId();
        this.classId = report.getClassId();
        this.reportDate = report.getReportDate();
        this.reportDateFormatted = report.getReportDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
        this.overallGrade = report.getOverallGrade();
        this.homeworkCompletionRate = report.getHomeworkCompletionRate();
        this.averageScore = report.getAverageScore();
        this.totalHomeworksAssigned = report.getTotalHomeworksAssigned();
        this.totalHomeworksCompleted = report.getTotalHomeworksCompleted();
        this.onTimeSubmissions = report.getOnTimeSubmissions();
        this.lateSubmissions = report.getLateSubmissions();
        this.strengths = report.getStrengths();
        this.areasForImprovement = report.getAreasForImprovement();
        this.teacherNotes = report.getTeacherNotes();
        this.recommendations = report.getRecommendations();
        this.createdAt = report.getCreatedAt();
        this.updatedAt = report.getUpdatedAt();
    }
    
    // Static factory method
    public static ReportResponse fromEntity(Report report) {
        return new ReportResponse(report);
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
    
    public Long getStudentId() {
        return studentId;
    }
    
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
    
    public String getStudentName() {
        return studentName;
    }
    
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
    
    public String getStudentEmail() {
        return studentEmail;
    }
    
    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
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
    
    public Long getClassId() {
        return classId;
    }
    
    public void setClassId(Long classId) {
        this.classId = classId;
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
    

    
    public LocalDateTime getReportDate() {
        return reportDate;
    }
    
    public void setReportDate(LocalDateTime reportDate) {
        this.reportDate = reportDate;
    }
    
    public String getReportDateFormatted() {
        return reportDateFormatted;
    }
    
    public void setReportDateFormatted(String reportDateFormatted) {
        this.reportDateFormatted = reportDateFormatted;
    }
    
    public String getOverallGrade() {
        return overallGrade;
    }
    
    public void setOverallGrade(String overallGrade) {
        this.overallGrade = overallGrade;
    }
    
    public Double getHomeworkCompletionRate() {
        return homeworkCompletionRate;
    }
    
    public void setHomeworkCompletionRate(Double homeworkCompletionRate) {
        this.homeworkCompletionRate = homeworkCompletionRate;
    }
    
    public Double getAverageScore() {
        return averageScore;
    }
    
    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }
    
    public Integer getTotalHomeworksAssigned() {
        return totalHomeworksAssigned;
    }
    
    public void setTotalHomeworksAssigned(Integer totalHomeworksAssigned) {
        this.totalHomeworksAssigned = totalHomeworksAssigned;
    }
    
    public Integer getTotalHomeworksCompleted() {
        return totalHomeworksCompleted;
    }
    
    public void setTotalHomeworksCompleted(Integer totalHomeworksCompleted) {
        this.totalHomeworksCompleted = totalHomeworksCompleted;
    }
    
    public Integer getOnTimeSubmissions() {
        return onTimeSubmissions;
    }
    
    public void setOnTimeSubmissions(Integer onTimeSubmissions) {
        this.onTimeSubmissions = onTimeSubmissions;
    }
    
    public Integer getLateSubmissions() {
        return lateSubmissions;
    }
    
    public void setLateSubmissions(Integer lateSubmissions) {
        this.lateSubmissions = lateSubmissions;
    }
    
    public String getStrengths() {
        return strengths;
    }
    
    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }
    
    public String getAreasForImprovement() {
        return areasForImprovement;
    }
    
    public void setAreasForImprovement(String areasForImprovement) {
        this.areasForImprovement = areasForImprovement;
    }
    
    public String getTeacherNotes() {
        return teacherNotes;
    }
    
    public void setTeacherNotes(String teacherNotes) {
        this.teacherNotes = teacherNotes;
    }
    
    public String getRecommendations() {
        return recommendations;
    }
    
    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
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
