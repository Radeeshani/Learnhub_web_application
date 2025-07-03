package com.homework.enums;

public enum UserRole {
    ADMIN("Admin"),
    TEACHER("Teacher"),
    STUDENT("Student"),
    PARENT("Parent");
    
    private final String displayName;
    
    UserRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
} 