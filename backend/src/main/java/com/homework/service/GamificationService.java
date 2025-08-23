package com.homework.service;

import com.homework.entity.Badge;
import com.homework.entity.UserProgress;
import com.homework.entity.User;
import com.homework.entity.HomeworkSubmission;
import com.homework.repository.BadgeRepository;
import com.homework.repository.UserProgressRepository;
import com.homework.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class GamificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(GamificationService.class);
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private BadgeRepository badgeRepository;
    
    @Autowired
    private UserRepository userRepository;
    
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
        Optional<UserProgress> existingProgress = userProgressRepository.findByUserId(userId);
        
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
}
