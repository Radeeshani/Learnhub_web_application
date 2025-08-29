package com.homework.dto;

import com.homework.entity.HomeworkSubmission;
import com.homework.entity.User;
import com.homework.entity.Homework;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HomeworkSubmissionResponse {
    
    private Long id;
    private Long homeworkId;
    private Long studentId;
    private String studentName;
    private String studentProfilePicture;
    private String submissionText;
    private String attachmentUrl;
    private String attachmentName;
    private String audioData; // Base64 encoded audio data for voice recordings
    private String imageData; // Base64 encoded image data for photo submissions
    private String pdfData; // Base64 encoded PDF data for PDF submissions
    private String submissionType;
    private LocalDateTime submittedAt;
    private boolean isLate;
    private Integer grade;
    private String feedback;
    private LocalDateTime gradedAt;
    private String status;
    private String homeworkTitle;
    private String subject;
    private LocalDateTime dueDate;
    
    public static HomeworkSubmissionResponse fromEntity(HomeworkSubmission submission) {
        HomeworkSubmissionResponse response = new HomeworkSubmissionResponse();
        response.setId(submission.getId());
        response.setHomeworkId(submission.getHomeworkId());
        response.setStudentId(submission.getStudentId());
        response.setSubmissionText(submission.getSubmissionText());
        response.setAttachmentUrl(submission.getAttachmentUrl());
        response.setAttachmentName(submission.getAttachmentName());
        response.setAudioData(submission.getAudioData());
        response.setImageData(submission.getImageData());
        response.setPdfData(submission.getPdfData());
        response.setSubmissionType(submission.getSubmissionType() != null ? submission.getSubmissionType().name() : null);
        response.setSubmittedAt(submission.getSubmittedAt());
        response.setLate(submission.isLate());
        response.setGrade(submission.getGrade());
        response.setFeedback(submission.getFeedback());
        response.setGradedAt(submission.getGradedAt());
        response.setStatus(submission.getStatus() != null ? submission.getStatus().name() : null);
        return response;
    }
    
    public static HomeworkSubmissionResponse fromEntity(HomeworkSubmission submission, User student, Homework homework) {
        HomeworkSubmissionResponse response = fromEntity(submission);
        
        // Add student information
        if (student != null) {
            response.setStudentName(student.getFirstName() + " " + student.getLastName());
            response.setStudentProfilePicture(student.getProfilePicture());
        }
        
        // Add homework information
        if (homework != null) {
            response.setHomeworkTitle(homework.getTitle());
            response.setSubject(homework.getSubject());
            response.setDueDate(homework.getDueDate());
        }
        
        return response;
    }
}
