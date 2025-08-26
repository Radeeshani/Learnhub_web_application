package com.homework.service;

import com.homework.entity.*;
import com.homework.repository.*;
import com.homework.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class GamificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(GamificationService.class);
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private BadgeRepository badgeRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserLevelRepository userLevelRepository;
    
    @Autowired
    private ChallengeRepository challengeRepository;
    
    @Autowired
    private UserChallengeRepository userChallengeRepository;
    
    // Points system
    private static final int POINTS_HOMEWORK_COMPLETION = 10;
    private static final int POINTS_ON_TIME_SUBMISSION = 5;
    private static final int POINTS_PERFECT_SCORE = 15;
    private static final int POINTS_STREAK_MILESTONE = 10;
    
    /**
     * Process homework submission and award points/badges
     */
    public void processHomeworkSubmission(HomeworkSubmission submission) {
        try {
            Long studentId = submission.getStudentId();
            UserProgress progress = getUserProgressOrCreate(studentId);
            
            // Award points for submission
            int pointsEarned = POINTS_HOMEWORK_COMPLETION;
            progress.addPoints(pointsEarned);
            progress.incrementTotalSubmissions();
            progress.incrementHomeworkCompleted();
            
            // Check if submission is on time
            if (!submission.isLate()) {
                pointsEarned += POINTS_ON_TIME_SUBMISSION;
                progress.addPoints(POINTS_ON_TIME_SUBMISSION);
                progress.incrementOnTimeSubmission();
            }
            
            // Update streak
            updateSubmissionStreak(progress);
            
            // Check for perfect score
            if (submission.getGrade() != null && submission.getGrade() == 100) {
                pointsEarned += POINTS_PERFECT_SCORE;
                progress.addPoints(POINTS_PERFECT_SCORE);
                progress.incrementPerfectScore();
            }
            
            // Update last submission date
            progress.setLastSubmissionDate(LocalDateTime.now());
            
            // Save progress
            userProgressRepository.save(progress);
            
            // Check for new badges
            checkAndAwardBadges(progress);
            
            logger.debug("Awarded {} points to student {} for homework submission", pointsEarned, studentId);
            
        } catch (Exception e) {
            logger.error("Error processing homework submission for gamification", e);
        }
    }
    
    /**
     * Process homework grading and award points/badges
     */
    public void processHomeworkGrading(HomeworkSubmission submission) {
        try {
            Long studentId = submission.getStudentId();
            UserProgress progress = getUserProgressOrCreate(studentId);
            
            // Check for perfect score
            if (submission.getGrade() != null && submission.getGrade() == 100) {
                progress.addPoints(POINTS_PERFECT_SCORE);
                progress.incrementPerfectScore();
                userProgressRepository.save(progress);
                
                // Check for new badges
                checkAndAwardBadges(progress);
                
                logger.debug("Awarded {} points to student {} for perfect score", POINTS_PERFECT_SCORE, studentId);
            }
            
        } catch (Exception e) {
            logger.error("Error processing homework grading for gamification", e);
        }
    }
    
    /**
     * Get user progress or create if doesn't exist
     */
    private UserProgress getUserProgressOrCreate(Long userId) {
        Optional<UserProgress> existingProgress = userProgressRepository.findUniqueByUserId(userId);
        
        if (existingProgress.isPresent()) {
            return existingProgress.get();
        }
        
        // Create new progress record
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            UserProgress newProgress = new UserProgress(user.get());
            return userProgressRepository.save(newProgress);
        }
        
        // If user doesn't exist, create a basic progress record
        UserProgress newProgress = new UserProgress();
        newProgress.setUserId(userId);
        return userProgressRepository.save(newProgress);
    }
    
    /**
     * Update submission streak
     */
    private void updateSubmissionStreak(UserProgress progress) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastSubmission = progress.getLastSubmissionDate();
        
        if (lastSubmission != null) {
            // Check if submission is within 24 hours of last submission
            if (lastSubmission.plusDays(1).isAfter(now)) {
                progress.updateStreak(progress.getCurrentStreak() + 1);
                
                // Award streak milestone points
                if (progress.getCurrentStreak() % 5 == 0) {
                    progress.addPoints(POINTS_STREAK_MILESTONE);
                    logger.debug("Awarded streak milestone points for {} day streak", progress.getCurrentStreak());
                }
            } else {
                // Reset streak if more than 24 hours have passed
                progress.updateStreak(1);
            }
        } else {
            // First submission
            progress.updateStreak(1);
        }
    }
    
    /**
     * Check and award badges based on current progress
     */
    private void checkAndAwardBadges(UserProgress progress) {
        List<Badge> availableBadges = badgeRepository.findByIsActiveTrue();
        
        for (Badge badge : availableBadges) {
            if (shouldAwardBadge(progress, badge)) {
                awardBadge(progress, badge);
            }
        }
    }
    
    /**
     * Check if user should be awarded a specific badge
     */
    private boolean shouldAwardBadge(UserProgress progress, Badge badge) {
        // Check if user already has this badge
        if (progress.getEarnedBadges().contains(badge)) {
            return false;
        }
        
        // Check badge requirements based on type
        switch (badge.getType()) {
            case HOMEWORK_COMPLETION:
                return progress.getHomeworkCompleted() >= 1;
                
            case ON_TIME_SUBMISSION:
                return progress.getOnTimeSubmissions() >= 1;
                
            case PERFECT_SCORE:
                return progress.getPerfectScores() >= 1;
                
            case STREAK:
                return progress.getCurrentStreak() >= 5;
                
            case SUBJECT_MASTERY:
                // This would need more complex logic based on subject-specific completion
                return progress.getHomeworkCompleted() >= 10;
                
            case CONSISTENCY:
                return progress.getOnTimeSubmissions() >= 10;
                
            default:
                return false;
        }
    }
    
    /**
     * Award a badge to a user
     */
    private void awardBadge(UserProgress progress, Badge badge) {
        progress.getEarnedBadges().add(badge);
        userProgressRepository.save(progress);
        
        logger.info("Awarded badge '{}' to user {}", badge.getName(), progress.getUserId());
        
        // TODO: Send notification about badge earned
    }
    
    /**
     * Get user progress by user ID
     */
    public UserProgress getUserProgress(Long userId) {
        return getUserProgressOrCreate(userId);
    }
    
    /**
     * Get leaderboard (top users by points)
     */
    public List<UserProgress> getLeaderboard(int limit) {
        return userProgressRepository.findTopByOrderByTotalPointsDesc(limit);
    }
    
    /**
     * Get available badges
     */
    public List<Badge> getAvailableBadges() {
        return badgeRepository.findByIsActiveTrue();
    }
    
    /**
     * Get user's earned badges
     */
    public Set<Badge> getUserBadges(Long userId) {
        UserProgress progress = getUserProgressOrCreate(userId);
        return progress.getEarnedBadges();
    }
    
    // New Level Progression Methods
    public UserLevelResponse getCurrentUserLevel(Long userId) {
        UserProgress progress = getUserProgressOrCreate(userId);
        UserLevel currentLevel = userLevelRepository.findCurrentLevel(progress.getTotalPoints())
                .orElseGet(() -> userLevelRepository.findByLevelNumber(1).orElse(null));
        
        if (currentLevel == null) return null;
        
        return new UserLevelResponse(
            currentLevel.getId(),
            currentLevel.getName(),
            currentLevel.getLevelNumber(),
            currentLevel.getPointsRequired(),
            currentLevel.getColor(),
            currentLevel.getSpecialPrivileges(),
            currentLevel.getLevelUpAnimation(),
            currentLevel.getIsActive(),
            currentLevel.getCreatedAt()
        );
    }
    
    public UserLevelResponse getNextUserLevel(Long userId) {
        UserProgress progress = getUserProgressOrCreate(userId);
        UserLevel nextLevel = userLevelRepository.findNextLevel(progress.getTotalPoints())
                .orElse(null);
        
        if (nextLevel == null) return null;
        
        return new UserLevelResponse(
            nextLevel.getId(),
            nextLevel.getName(),
            nextLevel.getLevelNumber(),
            nextLevel.getPointsRequired(),
            nextLevel.getColor(),
            nextLevel.getSpecialPrivileges(),
            nextLevel.getLevelUpAnimation(),
            nextLevel.getIsActive(),
            nextLevel.getCreatedAt()
        );
    }
    
    public List<UserLevelResponse> getAllUserLevels() {
        return userLevelRepository.findByIsActiveTrueOrderByLevelNumberAsc()
                .stream()
                .map(level -> new UserLevelResponse(
                    level.getId(),
                    level.getName(),
                    level.getLevelNumber(),
                    level.getPointsRequired(),
                    level.getColor(),
                    level.getSpecialPrivileges(),
                    level.getLevelUpAnimation(),
                    level.getIsActive(),
                    level.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
    
    // New Challenge Methods
    public List<ChallengeResponse> getActiveChallenges(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Challenge> activeChallenges = challengeRepository.findActiveChallenges(now);
        
        return activeChallenges.stream().map(challenge -> {
            ChallengeResponse response = new ChallengeResponse(
                challenge.getId(),
                challenge.getTitle(),
                challenge.getDescription(),
                challenge.getType(),
                challenge.getPointsReward(),
                challenge.getStartDate(),
                challenge.getEndDate(),
                challenge.getCriteria(),
                challenge.getRewardIcon(),
                challenge.getIsActive(),
                challenge.getCreatedAt()
            );
            
            // Get user progress for this challenge
            Optional<UserChallenge> userChallenge = userChallengeRepository.findByUserIdAndChallengeId(userId, challenge.getId());
            if (userChallenge.isPresent()) {
                UserChallenge uc = userChallenge.get();
                response.setUserProgress(uc.getProgress());
                response.setTarget(uc.getTarget());
                response.setIsCompleted(uc.getIsCompleted());
                response.setCompletionPercentage(uc.getCompletionPercentage());
            } else {
                // Create user challenge if it doesn't exist
                createUserChallenge(userId, challenge.getId());
                response.setUserProgress(0);
                response.setTarget(parseChallengeTarget(challenge.getCriteria()));
                response.setIsCompleted(false);
                response.setCompletionPercentage(0.0);
            }
            
            return response;
        }).collect(Collectors.toList());
    }
    
    public List<ChallengeResponse> getChallengesByType(Long userId, Challenge.ChallengeType type) {
        LocalDateTime now = LocalDateTime.now();
        List<Challenge> challenges = challengeRepository.findActiveChallengesByType(type, now);
        
        return challenges.stream().map(challenge -> {
            ChallengeResponse response = new ChallengeResponse(
                challenge.getId(),
                challenge.getTitle(),
                challenge.getDescription(),
                challenge.getType(),
                challenge.getPointsReward(),
                challenge.getStartDate(),
                challenge.getEndDate(),
                challenge.getCriteria(),
                challenge.getRewardIcon(),
                challenge.getIsActive(),
                challenge.getCreatedAt()
            );
            
            // Get user progress for this challenge
            Optional<UserChallenge> userChallenge = userChallengeRepository.findByUserIdAndChallengeId(userId, challenge.getId());
            if (userChallenge.isPresent()) {
                UserChallenge uc = userChallenge.get();
                response.setUserProgress(uc.getProgress());
                response.setTarget(uc.getTarget());
                response.setIsCompleted(uc.getIsCompleted());
                response.setCompletionPercentage(uc.getCompletionPercentage());
            } else {
                response.setUserProgress(0);
                response.setTarget(parseChallengeTarget(challenge.getCriteria()));
                response.setIsCompleted(false);
                response.setCompletionPercentage(0.0);
            }
            
            return response;
        }).collect(Collectors.toList());
    }
    
    public void updateChallengeProgress(Long userId, Long challengeId, Integer progress) {
        Optional<UserChallenge> userChallengeOpt = userChallengeRepository.findByUserIdAndChallengeId(userId, challengeId);
        
        if (userChallengeOpt.isPresent()) {
            UserChallenge userChallenge = userChallengeOpt.isPresent() ? userChallengeOpt.get() : null;
            if (userChallenge != null) {
                userChallenge.setProgress(progress);
                
                // Check if challenge is completed
                if (progress >= userChallenge.getTarget() && !userChallenge.getIsCompleted()) {
                    userChallenge.setIsCompleted(true);
                    userChallenge.setCompletedAt(LocalDateTime.now());
                    
                    // Award points
                    Challenge challenge = challengeRepository.findById(challengeId).orElse(null);
                    if (challenge != null) {
                        UserProgress userProgress = getUserProgressOrCreate(userId);
                        userProgress.addPoints(challenge.getPointsReward());
                        userProgressRepository.save(userProgress);
                        
                        userChallenge.setPointsEarned(challenge.getPointsReward());
                    }
                }
                
                userChallengeRepository.save(userChallenge);
            }
        }
    }
    
    // Enhanced Progress Methods
    public Map<String, Object> getEnhancedUserProgress(Long userId) {
        UserProgress progress = getUserProgressOrCreate(userId);
        UserLevel currentLevel = userLevelRepository.findCurrentLevel(progress.getTotalPoints())
                .orElseGet(() -> userLevelRepository.findByLevelNumber(1).orElse(null));
        UserLevel nextLevel = userLevelRepository.findNextLevel(progress.getTotalPoints()).orElse(null);
        
        Map<String, Object> enhancedProgress = new HashMap<>();
        enhancedProgress.put("id", progress.getId());
        enhancedProgress.put("totalPoints", progress.getTotalPoints());
        enhancedProgress.put("currentStreak", progress.getCurrentStreak());
        enhancedProgress.put("longestStreak", progress.getLongestStreak());
        enhancedProgress.put("homeworkCompleted", progress.getHomeworkCompleted());
        enhancedProgress.put("onTimeSubmissions", progress.getOnTimeSubmissions());
        enhancedProgress.put("perfectScores", progress.getPerfectScores());
        enhancedProgress.put("totalSubmissions", progress.getTotalSubmissions());
        enhancedProgress.put("currentLevel", progress.getCurrentLevel());
        enhancedProgress.put("experiencePoints", progress.getExperiencePoints());
        enhancedProgress.put("lastSubmissionDate", progress.getLastSubmissionDate());
        
        if (currentLevel != null) {
            enhancedProgress.put("currentLevelName", currentLevel.getName());
            enhancedProgress.put("currentLevelColor", currentLevel.getColor());
            enhancedProgress.put("currentLevelPrivileges", currentLevel.getSpecialPrivileges());
        }
        
        if (nextLevel != null) {
            enhancedProgress.put("nextLevelName", nextLevel.getName());
            enhancedProgress.put("nextLevelRequired", nextLevel.getPointsRequired());
            enhancedProgress.put("pointsToNextLevel", nextLevel.getPointsRequired() - progress.getTotalPoints());
            enhancedProgress.put("progressToNextLevel", calculateProgressToNextLevel(progress.getTotalPoints(), nextLevel.getPointsRequired()));
        }
        
        return enhancedProgress;
    }
    
    // Helper Methods
    private void createUserChallenge(Long userId, Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId).orElse(null);
        if (challenge != null) {
            UserChallenge userChallenge = new UserChallenge(userId, challengeId, parseChallengeTarget(challenge.getCriteria()));
            userChallengeRepository.save(userChallenge);
        }
    }
    
    private Integer parseChallengeTarget(String criteria) {
        // Simple parsing for now - can be enhanced later
        try {
            // Extract number from criteria like "Complete 5 homeworks"
            String[] parts = criteria.split("\\s+");
            for (String part : parts) {
                if (part.matches("\\d+")) {
                    return Integer.parseInt(part);
                }
            }
        } catch (Exception e) {
            // Default target
        }
        return 1; // Default target
    }
    
    private Double calculateProgressToNextLevel(Integer currentPoints, Integer nextLevelPoints) {
        if (nextLevelPoints <= currentPoints) return 100.0;
        
        // Find current level points
        UserLevel currentLevel = userLevelRepository.findCurrentLevel(currentPoints).orElse(null);
        if (currentLevel == null) return 0.0;
        
        Integer currentLevelPoints = currentLevel.getPointsRequired();
        Integer pointsRange = nextLevelPoints - currentLevelPoints;
        Integer userProgress = currentPoints - currentLevelPoints;
        
        return Math.min(100.0, (userProgress.doubleValue() / pointsRange.doubleValue()) * 100);
    }
    
    // Method to award points and check level up
    public void awardPoints(Long userId, Integer points, String reason) {
        UserProgress progress = getUserProgressOrCreate(userId);
        progress.addPoints(points);
        
        // Check if user can level up
        UserLevel nextLevel = userLevelRepository.findNextLevel(progress.getTotalPoints()).orElse(null);
        if (nextLevel != null && progress.canLevelUp(nextLevel.getPointsRequired())) {
            progress.levelUp();
            // Could trigger level up notification here
        }
        
        userProgressRepository.save(progress);
    }
}
