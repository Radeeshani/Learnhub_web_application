-- Migration V4: Add Classes, Enrollments, and Assignments tables

-- Create classes table
CREATE TABLE classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade_level VARCHAR(50),
    description TEXT,
    schedule_info VARCHAR(500),
    room_number VARCHAR(50),
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    max_students INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    teacher_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_classes_teacher (teacher_id),
    INDEX idx_classes_subject (subject),
    INDEX idx_classes_grade_level (grade_level),
    INDEX idx_classes_academic_year (academic_year),
    INDEX idx_classes_active (is_active)
);

-- Create enrollments table
CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    enrollment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'INACTIVE', 'DROPPED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    grade VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    
    UNIQUE KEY uk_enrollment_student_class (student_id, class_id),
    INDEX idx_enrollments_student (student_id),
    INDEX idx_enrollments_class (class_id),
    INDEX idx_enrollments_status (status),
    INDEX idx_enrollments_date (enrollment_date)
);

-- Create assignments table
CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type ENUM('HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT', 'ESSAY', 'PRESENTATION', 'LAB_REPORT', 'DISCUSSION', 'PARTICIPATION') NOT NULL,
    due_date TIMESTAMP NOT NULL,
    assigned_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    max_points INT,
    weight_percentage DECIMAL(5,2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    allow_late_submission BOOLEAN DEFAULT FALSE,
    late_submission_penalty DECIMAL(5,2) DEFAULT 0.0,
    attachments_info TEXT,
    submission_instructions TEXT,
    class_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_assignments_class (class_id),
    INDEX idx_assignments_created_by (created_by),
    INDEX idx_assignments_due_date (due_date),
    INDEX idx_assignments_type (assignment_type),
    INDEX idx_assignments_active (is_active)
);

-- Add foreign key constraints
ALTER TABLE classes 
ADD CONSTRAINT fk_classes_teacher 
FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE enrollments 
ADD CONSTRAINT fk_enrollments_student 
FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE enrollments 
ADD CONSTRAINT fk_enrollments_class 
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

ALTER TABLE assignments 
ADD CONSTRAINT fk_assignments_class 
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

ALTER TABLE assignments 
ADD CONSTRAINT fk_assignments_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- Insert sample data for testing
INSERT INTO classes (class_name, subject, grade_level, description, schedule_info, room_number, academic_year, semester, max_students, teacher_id) VALUES
('Mathematics 101', 'Mathematics', 'Grade 5', 'Basic mathematics concepts for fifth graders', 'Monday, Wednesday, Friday 9:00 AM - 10:00 AM', 'Room 201', '2024-2025', 'Fall', 25, 1),
('Science Discovery', 'Science', 'Grade 5', 'Introduction to scientific methods and basic concepts', 'Tuesday, Thursday 10:00 AM - 11:00 AM', 'Room 205', '2024-2025', 'Fall', 25, 1),
('English Literature', 'English', 'Grade 5', 'Reading and writing skills development', 'Monday, Wednesday, Friday 11:00 AM - 12:00 PM', 'Room 203', '2024-2025', 'Fall', 25, 1);

-- Insert sample enrollments
INSERT INTO enrollments (student_id, class_id, status) VALUES
(2, 1, 'ACTIVE'),
(3, 1, 'ACTIVE'),
(2, 2, 'ACTIVE'),
(3, 2, 'ACTIVE'),
(2, 3, 'ACTIVE'),
(3, 3, 'ACTIVE');

-- Insert sample assignments
INSERT INTO assignments (title, description, assignment_type, due_date, max_points, weight_percentage, class_id, created_by) VALUES
('Math Homework #1', 'Complete exercises 1-20 in Chapter 2', 'HOMEWORK', DATE_ADD(NOW(), INTERVAL 7 DAY), 100, 10.0, 1, 1),
('Science Quiz', 'Quiz on Chapter 1: Scientific Method', 'QUIZ', DATE_ADD(NOW(), INTERVAL 3 DAY), 50, 15.0, 2, 1),
('English Essay', 'Write a 500-word essay about your favorite book', 'ESSAY', DATE_ADD(NOW(), INTERVAL 14 DAY), 100, 20.0, 3, 1),
('Math Project', 'Create a poster showing different types of triangles', 'PROJECT', DATE_ADD(NOW(), INTERVAL 21 DAY), 150, 25.0, 1, 1);
