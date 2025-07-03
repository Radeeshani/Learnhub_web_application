-- Use the homework database
USE homework_db;

-- Clear existing data in reverse order of dependencies
DELETE FROM homework_submissions WHERE id > 0;
DELETE FROM homework WHERE id > 0;
DELETE FROM student_classes WHERE id > 0;
DELETE FROM classes WHERE id > 0;
DELETE FROM subjects WHERE id > 0;
DELETE FROM student_parent WHERE id > 0;
DELETE FROM users WHERE id > 0;

-- Reset auto-increment for all tables
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE classes AUTO_INCREMENT = 1;
ALTER TABLE subjects AUTO_INCREMENT = 1;
ALTER TABLE homework AUTO_INCREMENT = 1;
ALTER TABLE homework_submissions AUTO_INCREMENT = 1;

-- Insert Teachers
INSERT INTO users (email, password, first_name, last_name, role, phone_number, subject_taught) VALUES
('sarah.johnson@homework.edu', '$2a$10$example.hash.teacher1', 'Sarah', 'Johnson', 'TEACHER', '+1234567801', 'Mathematics'),
('michael.brown@homework.edu', '$2a$10$example.hash.teacher2', 'Michael', 'Brown', 'TEACHER', '+1234567802', 'Science'),
('emily.davis@homework.edu', '$2a$10$example.hash.teacher3', 'Emily', 'Davis', 'TEACHER', '+1234567803', 'English');

-- Insert Classes (now we can reference the teacher IDs that exist)
INSERT INTO classes (name, grade_level, academic_year, teacher_id) VALUES
('Grade 3A', 3, '2023-2024', 1),  -- Sarah Johnson
('Grade 4B', 4, '2023-2024', 2),  -- Michael Brown
('Grade 5C', 5, '2023-2024', 3);  -- Emily Davis

-- Insert Students
INSERT INTO users (email, password, first_name, last_name, role, phone_number, class_grade, student_id) VALUES
('john.student@homework.edu', '$2a$10$example.hash.student1', 'John', 'Smith', 'STUDENT', '+1234567901', '3rd Grade', 'STU001'),
('mary.student@homework.edu', '$2a$10$example.hash.student2', 'Mary', 'Johnson', 'STUDENT', '+1234567902', '4th Grade', 'STU002'),
('peter.student@homework.edu', '$2a$10$example.hash.student3', 'Peter', 'Brown', 'STUDENT', '+1234567903', '5th Grade', 'STU003');

-- Insert Parents
INSERT INTO users (email, password, first_name, last_name, role, phone_number, parent_of_student_id) VALUES
('david.smith@homework.edu', '$2a$10$example.hash.parent1', 'David', 'Smith', 'PARENT', '+1234567951', 4),  -- Parent of John
('susan.johnson@homework.edu', '$2a$10$example.hash.parent2', 'Susan', 'Johnson', 'PARENT', '+1234567952', 5), -- Parent of Mary
('robert.brown@homework.edu', '$2a$10$example.hash.parent3', 'Robert', 'Brown', 'PARENT', '+1234567953', 6);  -- Parent of Peter

-- Insert Subjects
INSERT INTO subjects (name, description, color) VALUES
('Mathematics', 'Core mathematics curriculum including algebra and geometry', '#4CAF50'),
('Science', 'General science including physics, chemistry, and biology', '#2196F3'),
('English', 'English language arts and literature', '#FF9800'),
('History', 'World and local history studies', '#9C27B0'),
('Physical Education', 'Sports and physical fitness activities', '#F44336');

-- Link Students to Classes
INSERT INTO student_classes (student_id, class_id, enrollment_date, is_active) VALUES
(4, 1, '2023-09-01', true),  -- John in Grade 3A
(5, 2, '2023-09-01', true),  -- Mary in Grade 4B
(6, 3, '2023-09-01', true);  -- Peter in Grade 5C

-- Insert Sample Homework Assignments
INSERT INTO homework (title, description, subject, class_grade, due_date, teacher_id) VALUES
('Algebra Basics', 'Complete exercises 1-10 from Chapter 3', 'Mathematics', '3rd Grade', '2024-01-20 23:59:59', 1),
('Science Project', 'Create a model of the solar system', 'Science', '4th Grade', '2024-01-25 23:59:59', 2),
('Book Report', 'Write a report on "Charlotte''s Web"', 'English', '5th Grade', '2024-01-30 23:59:59', 3);

-- Insert Sample Homework Submissions
INSERT INTO homework_submissions (homework_id, student_id, submission_text, submitted_at, is_late, status) VALUES
(1, 4, 'Completed all exercises', '2024-01-19 15:30:00', false, 'SUBMITTED'),
(2, 5, 'Created solar system model with recycled materials', '2024-01-24 16:45:00', false, 'SUBMITTED'),
(3, 6, 'Submitted 500-word book report', '2024-01-29 14:20:00', false, 'SUBMITTED');

-- Test Credentials for each role:
-- Teachers:
--   sarah.johnson@homework.edu / teacher123
--   michael.brown@homework.edu / teacher123
--   emily.davis@homework.edu / teacher123
--
-- Students:
--   john.student@homework.edu / student123
--   mary.student@homework.edu / student123
--   peter.student@homework.edu / student123
--
-- Parents:
--   david.smith@homework.edu / parent123
--   susan.johnson@homework.edu / parent123
--   robert.brown@homework.edu / parent123 