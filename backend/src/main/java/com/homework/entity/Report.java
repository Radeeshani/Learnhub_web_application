package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;
    
    @Column(name = "class_id", nullable = false)
    private Long classId;
    

    
    @Column(name = "report_date", nullable = false)
    private LocalDateTime reportDate;
    
    @Column(name = "overall_grade")
    private String overallGrade; // e.g., "A", "B+", "85%"
    
    @Column(name = "homework_completion_rate")
    private Double homeworkCompletionRate; // Percentage 0.0 - 100.0
    
    @Column(name = "average_score")
    private Double averageScore; // Average homework score 0.0 - 100.0
    
    @Column(name = "total_homeworks_assigned")
    private Integer totalHomeworksAssigned;
    
    @Column(name = "total_homeworks_completed")
    private Integer totalHomeworksCompleted;
    
    @Column(name = "on_time_submissions")
    private Integer onTimeSubmissions;
    
    @Column(name = "late_submissions")
    private Integer lateSubmissions;
    
    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths; // Areas where student excels
    
    @Column(name = "areas_for_improvement", columnDefinition = "TEXT")
    private String areasForImprovement; // Areas needing work
    
    @Column(name = "teacher_notes", columnDefinition = "TEXT")
    private String teacherNotes; // Additional teacher observations
    
    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations; // Suggestions for improvement
    

    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Report() {
        this.createdAt = LocalDateTime.now();
        this.reportDate = LocalDateTime.now();
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
    
    public Long getTeacherId() {
        return teacherId;
    }
    
    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
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
    
    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    @Override
    public String toString() {
        return "Report{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", studentId=" + studentId +
                ", teacherId=" + teacherId +
                ", classId=" + classId +
                '}';
    }
}
