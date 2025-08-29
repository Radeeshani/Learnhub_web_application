package com.homework.dto;

import java.time.LocalDateTime;

public class ReportRequest {
    
    private String title;
    private String description;
    private Long studentId;
    private Long classId;
    private LocalDateTime reportDate;
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
    
    // Constructors
    public ReportRequest() {}
    

    
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
    
    public Long getStudentId() {
        return studentId;
    }
    
    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
    
    public Long getClassId() {
        return classId;
    }
    
    public void setClassId(Long classId) {
        this.classId = classId;
    }
    

    
    public LocalDateTime getReportDate() {
        return reportDate;
    }
    
    public void setReportDate(LocalDateTime reportDate) {
        this.reportDate = reportDate;
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
    

}
