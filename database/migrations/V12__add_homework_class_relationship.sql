-- Migration V12: Add homework-class relationship
-- This migration creates a many-to-many relationship between homeworks and classes

-- Create homework_class_assignments table
CREATE TABLE homework_class_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    homework_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (homework_id) REFERENCES homeworks(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_homework_class (homework_id, class_id)
);

-- Add indexes for better performance
CREATE INDEX idx_homework_class_assignments_homework_id ON homework_class_assignments(homework_id);
CREATE INDEX idx_homework_class_assignments_class_id ON homework_class_assignments(class_id);

-- Add class_id column to homeworks table for backward compatibility
-- This will store the primary class for the homework
ALTER TABLE homeworks ADD COLUMN class_id BIGINT NULL;
ALTER TABLE homeworks ADD FOREIGN KEY (class_id) REFERENCES classes(id);

-- Create index for the new class_id column
CREATE INDEX idx_homeworks_class_id ON homeworks(class_id);

-- Update existing homeworks to link with appropriate classes based on class_grade
-- This is a data migration step
UPDATE homeworks h 
JOIN classes c ON h.class_grade = c.grade_level 
SET h.class_id = c.id 
WHERE c.teacher_id = h.teacher_id;

-- Insert homework-class assignments for existing homeworks
INSERT INTO homework_class_assignments (homework_id, class_id)
SELECT h.id, h.class_id 
FROM homeworks h 
WHERE h.class_id IS NOT NULL;

-- Make class_id NOT NULL after data migration
ALTER TABLE homeworks MODIFY COLUMN class_id BIGINT NOT NULL;
