-- Add audio fields to homeworks table
ALTER TABLE homeworks 
ADD COLUMN audio_file_name VARCHAR(255) NULL,
ADD COLUMN audio_file_url VARCHAR(500) NULL;
