package com.homework.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "homework_submissions")
@Data
@NoArgsConstructor
public class HomeworkSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "homework_id", nullable = false)
    private Long homeworkId;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "submission_text", columnDefinition = "TEXT")
    private String submissionText;
    
    @Column(name = "attachment_url")
    private String attachmentUrl;
    
    @Column(name = "attachment_name")
    private String attachmentName;
    
    @Column(name = "audio_data", columnDefinition = "LONGTEXT")
    private String audioData; // Store base64 encoded audio data for voice recordings
    
    @Column(name = "image_data", columnDefinition = "LONGTEXT")
    private String imageData; // Store base64 encoded image data for photo submissions
    
    @Column(name = "pdf_data", columnDefinition = "LONGTEXT")
    private String pdfData; // Store base64 encoded PDF data for PDF submissions
    
    @Enumerated(EnumType.STRING)
    @Column(name = "submission_type")
    private SubmissionType submissionType;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "is_late")
    private boolean isLate = false;
    
    @Column(name = "grade")
    private Integer grade;
    
    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
    
    @Column(name = "graded_by")
    private Long gradedBy;
    
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
    
    public enum SubmissionType {
        TEXT, VOICE, PHOTO, PDF, MIXED
    }
    
    public enum SubmissionStatus {
        SUBMITTED, GRADED, RETURNED
    }
}
