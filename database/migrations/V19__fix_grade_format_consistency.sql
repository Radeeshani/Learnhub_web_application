-- Migration V19: Fix grade format consistency
-- This migration ensures all homework records use the same grade format as students (4th Grade)

-- Update existing homework records to use consistent "4th Grade" format
UPDATE homeworks 
SET class_grade = CASE 
    WHEN class_grade = 'Grade 4' THEN '4th Grade'
    WHEN class_grade = 'Grade 3' THEN '3rd Grade'
    WHEN class_grade = 'Grade 5' THEN '5th Grade'
    WHEN class_grade = 'Grade 6' THEN '6th Grade'
    WHEN class_grade = 'Grade 7' THEN '7th Grade'
    WHEN class_grade = 'Grade 8' THEN '8th Grade'
    WHEN class_grade = 'Grade 9' THEN '9th Grade'
    WHEN class_grade = 'Grade 10' THEN '10th Grade'
    WHEN class_grade = 'Grade 11' THEN '11th Grade'
    WHEN class_grade = 'Grade 12' THEN '12th Grade'
    ELSE class_grade
END
WHERE class_grade LIKE 'Grade %';

-- Verify the update
SELECT id, title, class_grade FROM homeworks ORDER BY id DESC LIMIT 10;
