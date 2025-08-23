package com.homework.controller;

import com.homework.entity.Badge;
import com.homework.entity.UserProgress;
import com.homework.service.GamificationService;
import com.homework.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/gamification")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class GamificationController {
    
    private static final Logger logger = LoggerFactory.getLogger(GamificationController.class);
    
    @Autowired
    private GamificationService gamificationService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @GetMapping("/progress")
    public ResponseEntity<?> getUserProgress(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Temporarily disable authentication for testing
            logger.debug("Getting progress for user (authentication temporarily disabled)");
            
            // For testing, use a default user ID
            Long userId = 1L;
            
            UserProgress progress = gamificationService.getUserProgress(userId);
            return ResponseEntity.ok(progress);
            
        } catch (Exception e) {
            logger.error("Failed to get user progress", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/badges")
    public ResponseEntity<?> getUserBadges(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Temporarily disable authentication for testing
            logger.debug("Getting badges for user (authentication temporarily disabled)");
            
            List<Badge> badges = gamificationService.getAvailableBadges();
            return ResponseEntity.ok(badges);
            
        } catch (Exception e) {
            logger.error("Failed to get user badges", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get badges: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Temporarily disable authentication for testing
            logger.debug("Getting leaderboard with limit: {} (authentication temporarily disabled)", limit);
            
            List<UserProgress> leaderboard = gamificationService.getLeaderboard(limit);
            return ResponseEntity.ok(leaderboard);
            
        } catch (Exception e) {
            logger.error("Failed to get leaderboard", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get leaderboard: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getGamificationStats(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Validate JWT token
            if (!jwtTokenProvider.validateToken(token)) {
                logger.debug("Invalid JWT token");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // Extract user info from token
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            String userEmail = jwtTokenProvider.getEmailFromToken(token);
            
            logger.debug("Getting gamification stats for user: {} (ID: {})", userEmail, userId);
            
            UserProgress progress = gamificationService.getUserProgress(userId);
            List<Badge> badges = gamificationService.getAvailableBadges();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("progress", progress);
            stats.put("badges", badges);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Failed to get gamification stats", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
