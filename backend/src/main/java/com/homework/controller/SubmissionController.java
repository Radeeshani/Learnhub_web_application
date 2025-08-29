package com.homework.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/submission")
public class SubmissionController {
    
    @GetMapping("/test")
    public String test() {
        return "SubmissionController is working!";
    }
}
