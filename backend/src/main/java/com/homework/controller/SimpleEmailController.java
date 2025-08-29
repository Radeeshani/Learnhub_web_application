package com.homework.controller;

import com.homework.service.SimpleEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/simple-email")
public class SimpleEmailController {
    
    @Autowired
    private SimpleEmailService simpleEmailService;
    
    @GetMapping("/status")
    public String getStatus() {
        return simpleEmailService.getStatus();
    }
}
