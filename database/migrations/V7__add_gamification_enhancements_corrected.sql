-- Migration V7: Add Enhanced Gamification Features (Corrected)
-- This migration adds new tables and columns for level progression and challenges
-- Working with the existing database schema

-- Create user_levels table
CREATE TABLE IF NOT EXISTS user_levels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    level_number INT NOT NULL UNIQUE,
    points_required INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    special_privileges TEXT NOT NULL,
    level_up_animation VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL_EVENT') NOT NULL,
    points_reward INT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    criteria TEXT NOT NULL,
    reward_icon VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    challenge_id BIGINT NOT NULL,
    progress INT DEFAULT 0 NOT NULL,
    target INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMP NULL,
    points_earned INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_challenge (user_id, challenge_id)
);

-- Insert default user levels (only if they don't exist)
INSERT IGNORE INTO user_levels (name, level_number, points_required, color, special_privileges, level_up_animation) VALUES
('Novice', 1, 0, 'Bronze', 'Basic access to homework system', 'fade-in'),
('Apprentice', 2, 100, 'Silver', 'Can view detailed progress analytics', 'slide-up'),
('Scholar', 3, 500, 'Gold', 'Access to advanced study materials', 'bounce'),
('Master', 4, 1000, 'Platinum', 'Can create study groups', 'rotate'),
('Grandmaster', 5, 2500, 'Diamond', 'Full access to all features', 'explosion');

-- Insert sample challenges (only if they don't exist)
INSERT IGNORE INTO challenges (title, description, type, points_reward, start_date, end_date, criteria, reward_icon) VALUES
('Weekend Warrior', 'Complete 3 homeworks over the weekend', 'WEEKLY', 50, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Complete 3 homeworks', '🏆'),
('Perfect Week', 'Get 100% on all homeworks for 7 days', 'WEEKLY', 100, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Get 3 perfect scores', '⭐'),
('Daily Learner', 'Submit homework every day this week', 'DAILY', 25, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), 'Submit 1 homework', '📚'),
('Streak Master', 'Maintain a 14-day submission streak', 'MONTHLY', 200, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Maintain 14 day streak', '🔥'),
('Creative Thinker', 'Submit 5 creative assignments', 'MONTHLY', 150, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'Submit 5 creative assignments', '🎨');

-- Create indexes for better performance (using IGNORE to handle existing indexes)
CREATE INDEX idx_user_levels_level_number ON user_levels(level_number);
CREATE INDEX idx_user_levels_points_required ON user_levels(points_required);
CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_active ON challenges(is_active, start_date, end_date);
CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_completed ON user_challenges(is_completed);

-- Update existing user_progress records to have proper values
UPDATE user_progress SET 
    current_level = COALESCE(current_level, 1),
    total_points = COALESCE(total_points, 0),
    current_streak = COALESCE(current_streak, 0),
    longest_streak = COALESCE(longest_streak, 0),
    homework_completed = COALESCE(homework_completed, 0),
    on_time_submissions = COALESCE(on_time_submissions, 0),
    perfect_scores = COALESCE(perfect_scores, 0),
    total_submissions = COALESCE(total_submissions, 0)
WHERE current_level IS NULL 
   OR total_points IS NULL 
   OR current_streak IS NULL 
   OR longest_streak IS NULL 
   OR homework_completed IS NULL 
   OR on_time_submissions IS NULL 
   OR perfect_scores IS NULL 
   OR total_submissions IS NULL;
