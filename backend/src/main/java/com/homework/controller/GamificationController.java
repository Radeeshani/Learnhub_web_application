package com.homework.controller;

import com.homework.entity.Badge;
import com.homework.entity.UserProgress;
import com.homework.entity.Challenge;
import com.homework.service.GamificationService;
import com.homework.security.JwtTokenProvider;
import com.homework.dto.UserLevelResponse;
import com.homework.dto.ChallengeResponse;
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
            Long userId = null;
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7); // Remove "Bearer " prefix
                    
                    if (jwtTokenProvider.validateToken(token)) {
                        userId = jwtTokenProvider.getUserIdFromToken(token);
                        logger.debug("Successfully extracted user ID: {} from token", userId);
                    } else {
                        logger.debug("Token validation failed, token is invalid or expired");
                    }
                } catch (Exception e) {
                    logger.debug("Token validation failed with exception: {}", e.getMessage());
                }
            } else {
                logger.debug("No authorization header provided");
            }
            
            // If no valid token, use default user ID for testing
            if (userId == null) {
                userId = 1L; // Default user ID for testing
                logger.debug("Using default user ID: {}", userId);
            }
            
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
            Long userId = null;
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7); // Remove "Bearer " prefix
                    
                    if (jwtTokenProvider.validateToken(token)) {
                        userId = jwtTokenProvider.getUserIdFromToken(token);
                    }
                } catch (Exception e) {
                    logger.debug("Token validation failed, using default user: {}", e.getMessage());
                }
            }
            
            // If no valid token, use default user ID for testing
            if (userId == null) {
                userId = 1L; // Default user ID for testing
                logger.debug("Using default user ID: {}", userId);
            }
            
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
            Long userId = null;
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7); // Remove "Bearer " prefix
                    
                    if (jwtTokenProvider.validateToken(token)) {
                        userId = jwtTokenProvider.getUserIdFromToken(token);
                    }
                } catch (Exception e) {
                    logger.debug("Token validation failed, using default user: {}", e.getMessage());
                }
            }
            
            // If no valid token, use default user ID for testing
            if (userId == null) {
                userId = 1L; // Default user ID for testing
                logger.debug("Using default user ID: {}", userId);
            }
            
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
    
    // New Level Progression endpoints
    @GetMapping("/levels/current")
    public ResponseEntity<?> getCurrentUserLevel(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = null;
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7); // Remove "Bearer " prefix
                    
                    if (jwtTokenProvider.validateToken(token)) {
                        userId = jwtTokenProvider.getUserIdFromToken(token);
                    }
                } catch (Exception e) {
                    logger.debug("Token validation failed, using default user: {}", e.getMessage());
                }
            }
            
            // If no valid token, use default user ID for testing
            if (userId == null) {
                userId = 1L; // Default user ID for testing
                logger.debug("Using default user ID: {}", userId);
            }
            
            UserLevelResponse currentLevel = gamificationService.getCurrentUserLevel(userId);
            
            if (currentLevel == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(currentLevel);
            
        } catch (Exception e) {
            logger.error("Failed to get current user level", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch current level: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/levels/next")
    public ResponseEntity<?> getNextUserLevel(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = null;
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7); // Remove "Bearer " prefix
                    
                    if (jwtTokenProvider.validateToken(token)) {
                        userId = jwtTokenProvider.getUserIdFromToken(token);
                    }
                } catch (Exception e) {
                    logger.debug("Token validation failed, using default user: {}", e.getMessage());
                }
            }
            
            // If no valid token, use default user ID for testing
            if (userId == null) {
                userId = 1L; // Default user ID for testing
                logger.debug("Using default user ID: {}", userId);
            }
            
            logger.debug("Getting next level for user ID: {}", userId);
            UserLevelResponse nextLevel = gamificationService.getNextUserLevel(userId);
            
            if (nextLevel == null) {
                logger.info("User ID {} has reached maximum level", userId);
                return ResponseEntity.ok(Map.of("message", "You've reached the maximum level!"));
            }
            
            logger.debug("Found next level: {} for user ID: {}", nextLevel.getName(), userId);
            return ResponseEntity.ok(nextLevel);
            
        } catch (Exception e) {
            logger.error("Failed to get next user level for user ID: {}", userId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch next level: " + e.getMessage());
            error.put("details", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/levels/all")
    public ResponseEntity<?> getAllUserLevels() {
        try {
            List<UserLevelResponse> levels = gamificationService.getAllUserLevels();
            return ResponseEntity.ok(levels);
            
        } catch (Exception e) {
            logger.error("Failed to get all user levels", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch levels");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // New Challenge endpoints
    @GetMapping("/challenges")
    public ResponseEntity<?> getActiveChallenges(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = null;
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7); // Remove "Bearer " prefix
                    
                    if (jwtTokenProvider.validateToken(token)) {
                        userId = jwtTokenProvider.getUserIdFromToken(token);
                    }
                } catch (Exception e) {
                    logger.debug("Token validation failed, using default user: {}", e.getMessage());
                }
            }
            
            // If no valid token, use default user ID for testing
            if (userId == null) {
                userId = 1L; // Default user ID for testing
                logger.debug("Using default user ID: {}", userId);
            }
            
            List<ChallengeResponse> challenges = gamificationService.getActiveChallenges(userId);
            
            return ResponseEntity.ok(challenges);
            
        } catch (Exception e) {
            logger.error("Failed to get active challenges", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch challenges: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/challenges/{type}")
    public ResponseEntity<?> getChallengesByType(
            @PathVariable String type,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            if (!jwtTokenProvider.validateToken(token)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            Challenge.ChallengeType challengeType;
            try {
                challengeType = Challenge.ChallengeType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid challenge type");
                return ResponseEntity.badRequest().body(error);
            }
            
            List<ChallengeResponse> challenges = gamificationService.getChallengesByType(userId, challengeType);
            return ResponseEntity.ok(challenges);
            
        } catch (Exception e) {
            logger.error("Failed to get challenges by type", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch challenges");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // REMOVED: Manual progress update endpoint to prevent cheating
    // Progress can ONLY be updated through actual actions (homework submission, grading, etc.)
    // This ensures the gamification system is fair and cannot be manipulated
}
