-- Migration V13: Add grade column to homeworks table
-- This migration adds a grade column to store the numeric grade level (1-6) for homework assignments

-- Add grade column to homeworks table
ALTER TABLE homeworks ADD COLUMN grade INT NOT NULL DEFAULT 1;

-- Update existing homeworks to set grade based on class_grade
-- Extract numeric grade from class_grade field (e.g., "Grade 5" -> 5)
UPDATE homeworks 
SET grade = CAST(REGEXP_REPLACE(class_grade, '[^0-9]', '') AS UNSIGNED)
WHERE class_grade IS NOT NULL AND class_grade != '';

-- Set default grade for any remaining records
UPDATE homeworks SET grade = 1 WHERE grade IS NULL OR grade = 0;

-- Add index for better performance on grade queries
CREATE INDEX idx_homeworks_grade ON homeworks(grade);

-- Add constraint to ensure grade is between 1 and 6
ALTER TABLE homeworks ADD CONSTRAINT chk_grade_range CHECK (grade >= 1 AND grade <= 6);
