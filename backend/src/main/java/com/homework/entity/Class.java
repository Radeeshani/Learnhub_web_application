package com.homework.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "classes")
public class Class {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "class_name", nullable = false)
    private String className;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "subject", nullable = false)
    private String subject;
    
    @Column(name = "grade_level")
    private String gradeLevel;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "schedule_info")
    private String scheduleInfo; // e.g., "Monday, Wednesday, Friday 9:00 AM"
    
    @Column(name = "room_number")
    private String roomNumber;
    
    @Column(name = "academic_year")
    private String academicYear;
    
    @Column(name = "semester")
    private String semester;
    
    @Column(name = "max_students")
    private Integer maxStudents;
    
    @Column(name = "grade")
    private String grade;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private User teacher;
    
    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Enrollment> enrollments = new HashSet<>();
    
    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Assignment> assignments = new HashSet<>();
    
    // Constructors
    public Class() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Class(String className, String subject, String gradeLevel) {
        this();
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
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
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
    
    public String getGrade() {
        return grade;
    }
    
    public void setGrade(String grade) {
        this.grade = grade;
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
    
    public User getTeacher() {
        return teacher;
    }
    
    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }
    
    public Set<Enrollment> getEnrollments() {
        return enrollments;
    }
    
    public void setEnrollments(Set<Enrollment> enrollments) {
        this.enrollments = enrollments;
    }
    
    public Set<Assignment> getAssignments() {
        return assignments;
    }
    
    public void setAssignments(Set<Assignment> assignments) {
        this.assignments = assignments;
    }
    
    // Helper methods
    public void addEnrollment(Enrollment enrollment) {
        this.enrollments.add(enrollment);
        enrollment.setClassEntity(this);
    }
    
    public void removeEnrollment(Enrollment enrollment) {
        this.enrollments.remove(enrollment);
        enrollment.setClassEntity(null);
    }
    
    public void addAssignment(Assignment assignment) {
        this.assignments.add(assignment);
        assignment.setClassEntity(this);
    }
    
    public void removeAssignment(Assignment assignment) {
        this.assignments.remove(assignment);
        assignment.setClassEntity(null);
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "Class{" +
                "id=" + id +
                ", className='" + className + '\'' +
                ", subject='" + subject + '\'' +
                ", gradeLevel='" + gradeLevel + '\'' +
                ", teacher=" + (teacher != null ? teacher.getId() : "null") +
                '}';
    }
}
