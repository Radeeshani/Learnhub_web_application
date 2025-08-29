package com.homework.service;

import com.homework.entity.HomeworkSubmission;
import com.homework.entity.User;
import com.homework.entity.Homework;
import com.homework.repository.HomeworkSubmissionRepository;
import com.homework.repository.UserRepository;
import com.homework.repository.HomeworkRepository;
import com.homework.dto.HomeworkSubmissionRequest;
import com.homework.dto.HomeworkSubmissionResponse;
import com.homework.service.GamificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HomeworkSubmissionService {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeworkSubmissionService.class);
    
    @Autowired
    private HomeworkSubmissionRepository submissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HomeworkRepository homeworkRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private GamificationService gamificationService;
    
    public HomeworkSubmissionResponse submitHomework(HomeworkSubmissionRequest request, String studentEmail) {
        logger.debug("Received homework submission request: homeworkId={}, submissionType={}, hasText={}, hasAudio={}, hasImage={}, hasPdf={}", 
                   request.getHomeworkId(), request.getSubmissionType(), 
                   request.getSubmissionText() != null && !request.getSubmissionText().isEmpty(),
                   request.getAudioData() != null && !request.getAudioData().isEmpty(),
                   request.getImageData() != null && !request.getImageData().isEmpty(),
                   request.getPdfData() != null && !request.getPdfData().isEmpty());
        
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
        
        // First try to use the submission type provided by the frontend
        if (request.getSubmissionType() != null && !request.getSubmissionType().isEmpty()) {
            try {
                submissionType = HomeworkSubmission.SubmissionType.valueOf(request.getSubmissionType().toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid submission type provided: {}, will determine from content", request.getSubmissionType());
            }
        }
        
        // If no valid submission type was provided, determine from content
        if (submissionType == null) {
            if (request.getSubmissionText() != null && !request.getSubmissionText().isEmpty()) {
                submissionType = HomeworkSubmission.SubmissionType.TEXT;
            } else if (request.getAudioData() != null && !request.getAudioData().isEmpty()) {
                attachmentUrl = "voice_recording.wav";
                attachmentName = "voice_recording.wav";
                submissionType = HomeworkSubmission.SubmissionType.VOICE;
            } else if (request.getImageData() != null && !request.getImageData().isEmpty()) {
                attachmentUrl = "submission_photo.jpg";
                attachmentName = "submission_photo.jpg";
                submissionType = HomeworkSubmission.SubmissionType.PHOTO;
            } else if (request.getPdfData() != null && !request.getPdfData().isEmpty()) {
                attachmentUrl = "submission.pdf";
                attachmentName = "submission.pdf";
                submissionType = HomeworkSubmission.SubmissionType.PDF;
            } else {
                throw new RuntimeException("No submission content provided");
            }
        }
        
        // Set attachment details based on submission type if not already set
        if (attachmentUrl == null) {
            switch (submissionType) {
                case VOICE:
                    attachmentUrl = "voice_recording.wav";
                    attachmentName = "voice_recording.wav";
                    break;
                case PHOTO:
                    attachmentUrl = "submission_photo.jpg";
                    attachmentName = "submission_photo.jpg";
                    break;
                case PDF:
                    attachmentUrl = "submission.pdf";
                    attachmentName = "submission.pdf";
                    break;
                default:
                    break;
            }
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
        // Note: isLate field will be set by JPA/Hibernate based on the due date comparison
        submission.setStatus(HomeworkSubmission.SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());
        
        // Save submission
        HomeworkSubmission savedSubmission = submissionRepository.save(submission);
        
        // Create notification for teacher about new submission
        notificationService.createSubmissionNotification(savedSubmission, homework.getTitle());
        
        // Process gamification for homework submission
        gamificationService.processHomeworkSubmission(savedSubmission);
        
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
        
        // Update audio data if provided - clear old data when new data is provided
        if (request.getAudioData() != null && !request.getAudioData().isEmpty()) {
            submission.setAudioData(request.getAudioData());
            // Clear other attachment data when audio is provided
            submission.setImageData(null);
            submission.setPdfData(null);
        }
        
        // Update image data if provided - clear old data when new data is provided
        if (request.getImageData() != null && !request.getImageData().isEmpty()) {
            submission.setImageData(request.getImageData());
            // Clear other attachment data when image is provided
            submission.setAudioData(null);
            submission.setPdfData(null);
        }
        
        // Update PDF data if provided - clear old data when new data is provided
        if (request.getPdfData() != null && !request.getPdfData().isEmpty()) {
            submission.setPdfData(request.getPdfData());
            // Clear other attachment data when PDF is provided
            submission.setAudioData(null);
            submission.setImageData(null);
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
        } else if (request.getImageData() != null && !request.getImageData().isEmpty()) {
            attachmentUrl = "submission_photo.jpg";
            attachmentName = "submission_photo.jpg";
            submissionType = HomeworkSubmission.SubmissionType.PHOTO;
        } else if (request.getPdfData() != null && !request.getPdfData().isEmpty()) {
            attachmentUrl = "submission.pdf";
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
        
        // Process gamification for homework update (if this is a new submission)
        if (updatedSubmission.getStatus() == HomeworkSubmission.SubmissionStatus.SUBMITTED) {
            gamificationService.processHomeworkSubmission(updatedSubmission);
        }
        
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
        
        // Process gamification for homework grading
        gamificationService.processHomeworkGrading(gradedSubmission);
        
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
