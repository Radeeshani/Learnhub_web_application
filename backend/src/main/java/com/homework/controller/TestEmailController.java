package com.homework.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test-email")
public class TestEmailController {
    
    @GetMapping("/status")
    public String getStatus() {
        return "Test Email Controller is working!";
    }
}
