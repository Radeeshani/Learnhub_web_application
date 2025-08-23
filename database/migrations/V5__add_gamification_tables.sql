-- Migration V5: Add Gamification System Tables

-- Create badges table
CREATE TABLE badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    type ENUM('HOMEWORK_COMPLETION', 'ON_TIME_SUBMISSION', 'PERFECT_SCORE', 'STREAK', 'SUBJECT_MASTERY', 'HELPING_OTHERS', 'CREATIVITY', 'CONSISTENCY') NOT NULL,
    points_required INT NOT NULL,
    color VARCHAR(7) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_badges_type (type),
    INDEX idx_badges_points (points_required),
    INDEX idx_badges_active (is_active)
);

-- Create user_progress table
CREATE TABLE user_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_points INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    homework_completed INT NOT NULL DEFAULT 0,
    on_time_submissions INT NOT NULL DEFAULT 0,
    perfect_scores INT NOT NULL DEFAULT 0,
    total_submissions INT NOT NULL DEFAULT 0,
    last_submission_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_progress_user (user_id),
    INDEX idx_user_progress_points (total_points),
    INDEX idx_user_progress_streak (current_streak),
    INDEX idx_user_progress_completed (homework_completed),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_badges junction table
CREATE TABLE user_badges (
    user_progress_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_progress_id, badge_id),
    FOREIGN KEY (user_progress_id) REFERENCES user_progress(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    
    INDEX idx_user_badges_earned (earned_at)
);

-- Insert default badges
INSERT INTO badges (name, description, icon_url, type, points_required, color) VALUES
('First Steps', 'Complete your first homework assignment', '🏆', 'HOMEWORK_COMPLETION', 10, '#FFD700'),
('Early Bird', 'Submit homework before the due date', '🐦', 'ON_TIME_SUBMISSION', 15, '#32CD32'),
('Perfect Score', 'Get 100% on a homework assignment', '⭐', 'PERFECT_SCORE', 25, '#FF69B4'),
('Streak Master', 'Submit homework on time for 5 consecutive assignments', '🔥', 'STREAK', 50, '#FF4500'),
('Math Whiz', 'Complete 10 mathematics assignments', '📐', 'SUBJECT_MASTERY', 75, '#4169E1'),
('Helping Hand', 'Help another student with their homework', '🤝', 'HELPING_OTHERS', 30, '#20B2AA'),
('Creative Mind', 'Submit a creative or innovative homework solution', '🎨', 'CREATIVITY', 40, '#9370DB'),
('Consistent Learner', 'Submit homework on time for 10 consecutive assignments', '📚', 'CONSISTENCY', 100, '#8B4513'),
('Science Explorer', 'Complete 10 science assignments', '🔬', 'SUBJECT_MASTERY', 75, '#228B22'),
('English Scholar', 'Complete 10 English assignments', '📖', 'SUBJECT_MASTERY', 75, '#DC143C');

-- Insert sample user progress for existing users
INSERT INTO user_progress (user_id, total_points, current_streak, longest_streak, homework_completed, on_time_submissions, perfect_scores, total_submissions) VALUES
(1, 0, 0, 0, 0, 0, 0, 0), -- Teacher
(2, 0, 0, 0, 0, 0, 0, 0), -- Teacher  
(3, 0, 0, 0, 0, 0, 0, 0), -- Student
(4, 0, 0, 0, 0, 0, 0, 0), -- Student
(5, 0, 0, 0, 0, 0, 0, 0); -- Admin
