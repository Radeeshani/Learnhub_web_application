-- Use the homework database
USE homework_db;

-- Insert sample subjects
INSERT INTO subjects (name, description, color) VALUES
('Mathematics', 'Number operations, geometry, and problem solving', '#3B82F6'),
('English', 'Reading, writing, grammar, and literature', '#10B981'),
('Science', 'Natural sciences, experiments, and discovery', '#8B5CF6'),
('Social Studies', 'History, geography, and cultural studies', '#F59E0B'),
('Art', 'Creative expression and visual arts', '#EF4444'),
('Physical Education', 'Sports, fitness, and healthy living', '#06B6D4');

-- Insert sample users (passwords should be hashed in real application)
-- Admin
INSERT INTO users (email, password, first_name, last_name, role, phone) VALUES
('admin@homework.edu', '$2a$10$example.hash.admin', 'School', 'Administrator', 'ADMIN', '+1234567890');

-- Teachers
INSERT INTO users (email, password, first_name, last_name, role, phone) VALUES
('teacher1@homework.edu', '$2a$10$example.hash.teacher1', 'Sarah', 'Johnson', 'TEACHER', '+1234567891'),
('teacher2@homework.edu', '$2a$10$example.hash.teacher2', 'Michael', 'Brown', 'TEACHER', '+1234567892'),
('teacher3@homework.edu', '$2a$10$example.hash.teacher3', 'Emily', 'Davis', 'TEACHER', '+1234567893');

-- Students
INSERT INTO users (email, password, first_name, last_name, role, phone) VALUES
('student1@homework.edu', '$2a$10$example.hash.student1', 'Alex', 'Wilson', 'STUDENT', '+1234567894'),
('student2@homework.edu', '$2a$10$example.hash.student2', 'Emma', 'Miller', 'STUDENT', '+1234567895'),
('student3@homework.edu', '$2a$10$example.hash.student3', 'James', 'Garcia', 'STUDENT', '+1234567896'),
('student4@homework.edu', '$2a$10$example.hash.student4', 'Olivia', 'Martinez', 'STUDENT', '+1234567897');

-- Parents
INSERT INTO users (email, password, first_name, last_name, role, phone) VALUES
('parent1@homework.edu', '$2a$10$example.hash.parent1', 'Robert', 'Wilson', 'PARENT', '+1234567898'),
('parent2@homework.edu', '$2a$10$example.hash.parent2', 'Jennifer', 'Miller', 'PARENT', '+1234567899'),
('parent3@homework.edu', '$2a$10$example.hash.parent3', 'David', 'Garcia', 'PARENT', '+1234567800'),
('parent4@homework.edu', '$2a$10$example.hash.parent4', 'Lisa', 'Martinez', 'PARENT', '+1234567801');

-- Insert sample classes
INSERT INTO classes (name, grade_level, academic_year, teacher_id) VALUES
('Grade 3A', 3, '2023-2024', 2), -- Sarah Johnson
('Grade 4B', 4, '2023-2024', 3), -- Michael Brown
('Grade 5C', 5, '2023-2024', 4); -- Emily Davis

-- Assign students to classes
INSERT INTO student_classes (student_id, class_id, enrollment_date) VALUES
(5, 1, '2023-09-01'), -- Alex Wilson in Grade 3A
(6, 1, '2023-09-01'), -- Emma Miller in Grade 3A
(7, 2, '2023-09-01'), -- James Garcia in Grade 4B
(8, 3, '2023-09-01'); -- Olivia Martinez in Grade 5C

-- Create parent-student relationships
INSERT INTO student_parent (student_id, parent_id, relationship_type) VALUES
(5, 9, 'FATHER'),   -- Robert Wilson is Alex's father
(6, 10, 'MOTHER'),  -- Jennifer Miller is Emma's mother
(7, 11, 'FATHER'),  -- David Garcia is James's father
(8, 12, 'MOTHER');  -- Lisa Martinez is Olivia's mother

-- Insert sample homework assignments
INSERT INTO homework (title, description, subject_id, class_id, teacher_id, due_date, points) VALUES
('Addition and Subtraction Practice', 'Complete exercises 1-20 in your math workbook', 1, 1, 2, '2024-01-15 23:59:59', 100),
('Reading Comprehension: The Magic Garden', 'Read the story and answer the questions at the end', 2, 1, 2, '2024-01-16 23:59:59', 80),
('Science Experiment: Growing Plants', 'Observe your bean plant growth and record daily measurements', 3, 2, 3, '2024-01-20 23:59:59', 120),
('Geography Project: My Community', 'Create a map of your neighborhood with important landmarks', 4, 3, 4, '2024-01-18 23:59:59', 150);

-- Insert sample announcements
INSERT INTO announcements (title, content, author_id, class_id, priority, expire_date) VALUES
('Welcome Back to School!', 'We hope you had a wonderful break. Looking forward to a great semester!', 1, NULL, 'HIGH', '2024-02-01 23:59:59'),
('Parent-Teacher Conference', 'Scheduled for next Friday. Please check your email for appointment times.', 2, 1, 'MEDIUM', '2024-01-25 23:59:59'),
('Science Fair Announcement', 'Annual science fair will be held on March 15th. Start working on your projects!', 3, 2, 'HIGH', '2024-03-10 23:59:59');

-- Insert sample support requests
INSERT INTO support_requests (user_id, subject, message, category, priority) VALUES
(9, 'Cannot access homework submissions', 'I am unable to view my child homework submissions. The page keeps loading.', 'TECHNICAL', 'MEDIUM'),
(6, 'Question about math assignment', 'I do not understand problem #15 in the math homework. Can someone help?', 'ACADEMIC', 'LOW'),
(10, 'Request for additional reading materials', 'My child is interested in more advanced reading materials. Any recommendations?', 'GENERAL', 'LOW'); 