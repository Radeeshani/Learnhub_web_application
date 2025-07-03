package com.homework.dto;

import com.homework.enums.UserRole;

public class AuthResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String classGrade;
    private String subjectTaught;
    private String studentId;
    private String parentOfStudentId;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(String token, Long id, String email, String firstName, String lastName, UserRole role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
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
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public String getClassGrade() {
        return classGrade;
    }
    
    public void setClassGrade(String classGrade) {
        this.classGrade = classGrade;
    }
    
    public String getSubjectTaught() {
        return subjectTaught;
    }
    
    public void setSubjectTaught(String subjectTaught) {
        this.subjectTaught = subjectTaught;
    }
    
    public String getStudentId() {
        return studentId;
    }
    
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    
    public String getParentOfStudentId() {
        return parentOfStudentId;
    }
    
    public void setParentOfStudentId(String parentOfStudentId) {
        this.parentOfStudentId = parentOfStudentId;
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
} 