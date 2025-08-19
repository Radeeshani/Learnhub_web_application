package com.homework.service;

import com.homework.entity.HomeworkSubmission;
import com.homework.entity.User;
import com.homework.entity.Homework;
import com.homework.repository.HomeworkSubmissionRepository;
import com.homework.repository.UserRepository;
import com.homework.repository.HomeworkRepository;
import com.homework.dto.HomeworkSubmissionRequest;
import com.homework.dto.HomeworkSubmissionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HomeworkSubmissionService {
    
    @Autowired
    private HomeworkSubmissionRepository submissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HomeworkRepository homeworkRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public HomeworkSubmissionResponse submitHomework(HomeworkSubmissionRequest request, String studentEmail) {
        // Find student by email
        User student = userRepository.findByEmail(studentEmail)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Check if homework exists
        Homework homework = homeworkRepository.findById(request.getHomeworkId())
            .orElseThrow(() -> new RuntimeException("Homework not found"));
        
        // Check if student already submitted this homework
        if (submissionRepository.existsByHomeworkIdAndStudentId(request.getHomeworkId(), student.getId())) {
            throw new RuntimeException("Student has already submitted this homework");
        }
        
        // Determine submission type and attachment details
        String attachmentUrl = null;
        String attachmentName = null;
        HomeworkSubmission.SubmissionType submissionType = null;
        
        if (request.getSubmissionText() != null && !request.getSubmissionText().isEmpty()) {
            submissionType = HomeworkSubmission.SubmissionType.TEXT;
        } else if (request.getAudioData() != null && !request.getAudioData().isEmpty()) {
            attachmentUrl = "voice_recording.wav";
            attachmentName = "voice_recording.wav";
            submissionType = HomeworkSubmission.SubmissionType.VOICE;
        } else if (request.getPhotoUrl() != null && !request.getPhotoUrl().isEmpty()) {
            attachmentUrl = request.getPhotoUrl();
            attachmentName = "submission_photo.jpg";
            submissionType = HomeworkSubmission.SubmissionType.PHOTO;
            
            // If image data is provided, store it
            if (request.getImageData() != null && !request.getImageData().isEmpty()) {
                // The image data is already base64 encoded from the frontend
                // Just store it as is
            }
        } else if (request.getPdfUrl() != null && !request.getPdfUrl().isEmpty()) {
            attachmentUrl = request.getPdfUrl();
            attachmentName = "submission.pdf";
            submissionType = HomeworkSubmission.SubmissionType.PDF;
            
            // If PDF data is provided, store it
            if (request.getPdfData() != null && !request.getPdfData().isEmpty()) {
                // The PDF data is already base64 encoded from the frontend
                // Just store it as is
            }
        } else {
            throw new RuntimeException("No submission content provided");
        }
        
        // Check if submission is late
        boolean isLate = LocalDateTime.now().isAfter(homework.getDueDate());
        
        // Create submission
        HomeworkSubmission submission = new HomeworkSubmission();
        submission.setHomeworkId(request.getHomeworkId());
        submission.setStudentId(student.getId());
        submission.setSubmissionText(request.getSubmissionText());
        submission.setAttachmentUrl(attachmentUrl);
        submission.setAttachmentName(attachmentName);
        submission.setAudioData(request.getAudioData()); // Store the audio data
        submission.setImageData(request.getImageData()); // Store the image data
        submission.setPdfData(request.getPdfData()); // Store the PDF data
        submission.setSubmissionType(submissionType);
        submission.setLate(isLate);
        submission.setStatus(HomeworkSubmission.SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());
        
        // Save submission
        HomeworkSubmission savedSubmission = submissionRepository.save(submission);
        
        // Create notification for teacher about new submission
        notificationService.createSubmissionNotification(savedSubmission, homework.getTitle());
        
        // Convert to response DTO
        return HomeworkSubmissionResponse.fromEntity(savedSubmission, student, homework);
    }
    
    public HomeworkSubmissionResponse updateSubmission(Long submissionId, HomeworkSubmissionRequest request, String studentEmail) {
        // Find student by email
        User student = userRepository.findByEmail(studentEmail)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Find existing submission
        HomeworkSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        // Check if student owns this submission
        if (!submission.getStudentId().equals(student.getId())) {
            throw new RuntimeException("You can only update your own submissions");
        }
        
        // Check if submission can still be updated (not graded yet)
        if (submission.getStatus() == HomeworkSubmission.SubmissionStatus.GRADED) {
            throw new RuntimeException("Cannot update graded submission");
        }
        
        // Update text if provided
        if (request.getSubmissionText() != null) {
            submission.setSubmissionText(request.getSubmissionText());
        }
        
        // Update audio data if provided
        if (request.getAudioData() != null && !request.getAudioData().isEmpty()) {
            submission.setAudioData(request.getAudioData());
        }
        
        // Update image data if provided
        if (request.getImageData() != null && !request.getImageData().isEmpty()) {
            submission.setImageData(request.getImageData());
        }
        
        // Update PDF data if provided
        if (request.getPdfData() != null && !request.getPdfData().isEmpty()) {
            submission.setPdfData(request.getPdfData());
        }
        
        // Handle file updates
        String attachmentUrl = null;
        String attachmentName = null;
        HomeworkSubmission.SubmissionType submissionType = null;
        
        if (request.getSubmissionText() != null && !request.getSubmissionText().isEmpty()) {
            submissionType = HomeworkSubmission.SubmissionType.TEXT;
        } else if (request.getAudioData() != null && !request.getAudioData().isEmpty()) {
            attachmentUrl = "voice_recording.wav";
            attachmentName = "voice_recording.wav";
            submissionType = HomeworkSubmission.SubmissionType.VOICE;
        } else if (request.getPhotoUrl() != null && !request.getPhotoUrl().isEmpty()) {
            attachmentUrl = request.getPhotoUrl();
            attachmentName = "submission_photo.jpg";
            submissionType = HomeworkSubmission.SubmissionType.PHOTO;
        } else if (request.getPdfUrl() != null && !request.getPdfUrl().isEmpty()) {
            attachmentUrl = request.getPdfUrl();
            attachmentName = "submission.pdf";
            submissionType = HomeworkSubmission.SubmissionType.PDF;
        }
        
        if (attachmentUrl != null) {
            submission.setAttachmentUrl(attachmentUrl);
            submission.setAttachmentName(attachmentName);
        }
        
        if (submissionType != null) {
            submission.setSubmissionType(submissionType);
        }
        
        // Update submission time
        submission.setSubmittedAt(LocalDateTime.now());
        
        // Save updated submission
        HomeworkSubmission updatedSubmission = submissionRepository.save(submission);
        
        // Get homework details for response
        Homework homework = homeworkRepository.findById(submission.getHomeworkId())
            .orElseThrow(() -> new RuntimeException("Homework not found"));
        
        // Convert to response DTO
        return HomeworkSubmissionResponse.fromEntity(updatedSubmission, student, homework);
    }
    
    public HomeworkSubmissionResponse gradeSubmission(Long submissionId, int grade, String feedback, String teacherEmail) {
        // Find teacher by email
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        // Find submission
        HomeworkSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        // Update submission
        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setGradedAt(LocalDateTime.now());
        submission.setGradedBy(teacher.getId());
        submission.setStatus(HomeworkSubmission.SubmissionStatus.GRADED);
        
        // Save submission
        HomeworkSubmission gradedSubmission = submissionRepository.save(submission);
        
        // Get student and homework details
        User student = userRepository.findById(submission.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found"));
        Homework homework = homeworkRepository.findById(submission.getHomeworkId())
            .orElseThrow(() -> new RuntimeException("Homework not found"));
        
        // Create notification for student about grading
        notificationService.createGradedNotification(gradedSubmission, homework.getTitle());
        
        // Convert to response DTO
        return HomeworkSubmissionResponse.fromEntity(gradedSubmission, student, homework);
    }
    
    public List<HomeworkSubmissionResponse> getHomeworkSubmissions(Long homeworkId) {
        List<HomeworkSubmission> submissions = submissionRepository.findByHomeworkId(homeworkId);
        
        return submissions.stream()
            .map(submission -> {
                User student = userRepository.findById(submission.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
                Homework homework = homeworkRepository.findById(submission.getHomeworkId())
                    .orElseThrow(() -> new RuntimeException("Homework not found"));
                
                return HomeworkSubmissionResponse.fromEntity(submission, student, homework);
            })
            .collect(Collectors.toList());
    }
    
    public List<HomeworkSubmissionResponse> getStudentSubmissions(Long studentId) {
        List<HomeworkSubmission> submissions = submissionRepository.findByStudentId(studentId);
        
        return submissions.stream()
            .map(submission -> {
                User student = userRepository.findById(submission.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
                Homework homework = homeworkRepository.findById(submission.getHomeworkId())
                    .orElseThrow(() -> new RuntimeException("Homework not found"));
                
                return HomeworkSubmissionResponse.fromEntity(submission, student, homework);
            })
            .collect(Collectors.toList());
    }
    
    public HomeworkSubmissionResponse getSubmissionById(Long submissionId) {
        HomeworkSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        User student = userRepository.findById(submission.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found"));
        Homework homework = homeworkRepository.findById(submission.getHomeworkId())
            .orElseThrow(() -> new RuntimeException("Homework not found"));
        
        return HomeworkSubmissionResponse.fromEntity(submission, student, homework);
    }
}
