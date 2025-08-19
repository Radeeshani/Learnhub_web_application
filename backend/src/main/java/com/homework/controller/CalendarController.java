package com.homework.controller;

import com.homework.dto.CalendarEventRequest;
import com.homework.entity.CalendarEvent;
import com.homework.service.CalendarService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cal")
@CrossOrigin(origins = "*")
public class CalendarController {
    
    private static final Logger logger = LoggerFactory.getLogger(CalendarController.class);
    
    // Test endpoint to verify controller is loaded
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("CalendarController test endpoint called");
        return ResponseEntity.ok("CalendarController is working!");
    }
    
    // Simple test endpoint without dependencies
    @GetMapping("/simple")
    public ResponseEntity<Map<String, String>> simple() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Calendar controller is working!");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
