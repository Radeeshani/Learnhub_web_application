package com.homework.dto;

import java.time.LocalDateTime;

public class StudentInfo {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDateTime enrollmentDate;
    private Long enrollmentId;
    
    // Constructors
    public StudentInfo() {}
    
    public StudentInfo(Long id, String firstName, String lastName, String email, LocalDateTime enrollmentDate, Long enrollmentId) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.enrollmentDate = enrollmentDate;
        this.enrollmentId = enrollmentId;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public LocalDateTime getEnrollmentDate() {
        return enrollmentDate;
    }
    
    public void setEnrollmentDate(LocalDateTime enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }
    
    public Long getEnrollmentId() {
        return enrollmentId;
    }
    
    public void setEnrollmentId(Long enrollmentId) {
        this.enrollmentId = enrollmentId;
    }
}
