-- Migration V15: Add reports table for student reports
-- This migration creates a table to store comprehensive student reports with analytics

-- Create reports table
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    student_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    academic_period VARCHAR(100) NOT NULL,
    report_date TIMESTAMP NOT NULL,
    overall_grade VARCHAR(10),
    homework_completion_rate DECIMAL(5,2),
    average_score DECIMAL(5,2),
    total_homeworks_assigned INT,
    total_homeworks_completed INT,
    on_time_submissions INT,
    late_submissions INT,
    strengths TEXT,
    areas_for_improvement TEXT,
    teacher_notes TEXT,
    recommendations TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_reports_student (student_id),
    INDEX idx_reports_teacher (teacher_id),
    INDEX idx_reports_class (class_id),
    INDEX idx_reports_academic_period (academic_period),
    INDEX idx_reports_published (is_published),
    INDEX idx_reports_date (report_date),
    
    -- Unique constraint to prevent duplicate reports for same student, class, and period
    UNIQUE KEY uk_report_student_class_period (student_id, class_id, academic_period)
);

-- Insert sample data for testing
INSERT INTO reports (
    title, 
    student_id, 
    teacher_id, 
    class_id, 
    academic_period, 
    report_date, 
    overall_grade, 
    homework_completion_rate, 
    average_score, 
    total_homeworks_assigned, 
    total_homeworks_completed, 
    on_time_submissions, 
    late_submissions, 
    strengths, 
    areas_for_improvement, 
    teacher_notes, 
    recommendations, 
    is_published
) VALUES 
(
    'Mid-Semester Progress Report - Mathematics',
    2, -- Assuming student ID 2 exists
    1, -- Assuming teacher ID 1 exists
    1, -- Assuming class ID 1 exists
    '2024-2025 Fall Semester',
    NOW(),
    'B+',
    85.5,
    78.3,
    12,
    10,
    8,
    2,
    'Strong problem-solving skills, good attendance, participates well in class discussions',
    'Needs improvement in time management, could benefit from more practice with complex equations',
    'Student shows good potential and is making steady progress. Recommend additional practice with homework assignments.',
    'Continue with current study habits, consider joining study group, practice time management skills',
    TRUE
),
(
    'Quarter 1 Assessment Report - English',
    2, -- Assuming student ID 2 exists
    1, -- Assuming teacher ID 1 exists
    2, -- Assuming class ID 2 exists
    '2024-2025 Fall Semester',
    NOW(),
    'A-',
    92.0,
    88.7,
    8,
    8,
    7,
    1,
    'Excellent writing skills, creative thinking, strong vocabulary',
    'Could improve reading comprehension speed, needs more confidence in oral presentations',
    'Outstanding performance in written assignments. Student demonstrates strong analytical skills.',
    'Continue reading diverse materials, practice public speaking, maintain current writing quality',
    TRUE
);
