package com.homework.service;

import org.springframework.stereotype.Service;

@Service
public class SimpleEmailService {
    
    public String getStatus() {
        return "Simple Email Service is working!";
    }
}
