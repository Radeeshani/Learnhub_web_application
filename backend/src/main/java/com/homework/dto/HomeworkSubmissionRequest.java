package com.homework.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HomeworkSubmissionRequest {
    
    @NotNull(message = "Homework ID is required")
    private Long homeworkId;
    
    private String submissionText;
    
    private String voiceRecordingUrl;
    
    private String photoUrl;
    
    private String pdfUrl;
    
    private String audioData; // Base64 encoded audio data for voice recordings
    
    private String imageData; // Base64 encoded image data for photo submissions
    
    private String pdfData; // Base64 encoded PDF data for PDF submissions
    
    private String submissionType;
}
