package com.homework.service;

import com.homework.dto.ReportRequest;
import com.homework.dto.ReportResponse;
import com.homework.entity.Report;
import com.homework.entity.User;
import com.homework.entity.Class;
import com.homework.entity.Homework;
import com.homework.entity.HomeworkSubmission;
import com.homework.enums.UserRole;
import com.homework.repository.ReportRepository;
import com.homework.repository.UserRepository;
import com.homework.repository.ClassRepository;
import com.homework.repository.HomeworkRepository;
import com.homework.repository.HomeworkSubmissionRepository;
import com.homework.repository.EnrollmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

@Service
public class ReportService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ClassRepository classRepository;
    
    @Autowired
    private HomeworkRepository homeworkRepository;
    
    @Autowired
    private HomeworkSubmissionRepository submissionRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    /**
     * Create a new student report
     */
    public ReportResponse createReport(ReportRequest request, String teacherEmail) {
        try {
            // Find teacher by email
            User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            // Verify teacher role
            if (teacher.getRole() != UserRole.TEACHER) {
                throw new RuntimeException("User is not a teacher");
            }
            
            // Find student
            User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // Find class
            Class classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));
            
            // Verify teacher is assigned to this class
            if (classEntity.getTeacher() == null || !classEntity.getTeacher().getId().equals(teacher.getId())) {
                throw new RuntimeException("Teacher is not assigned to this class");
            }
            
            // Check if student is enrolled in this class
            if (!enrollmentRepository.existsByStudentIdAndClassEntityId(student.getId(), classEntity.getId())) {
                throw new RuntimeException("Student is not enrolled in this class");
            }
            
            // Check if report already exists for this student and class
            if (reportRepository.existsByStudentIdAndClassId(
                    student.getId(), classEntity.getId())) {
                throw new RuntimeException("Report already exists for this student and class");
            }
            
            // Calculate analytics if not provided
            if (request.getTotalHomeworksAssigned() == null || request.getAverageScore() == null) {
                Map<String, Object> analytics = calculateStudentAnalytics(student.getId(), classEntity.getId());
                request.setTotalHomeworksAssigned((Integer) analytics.get("totalAssigned"));
                request.setTotalHomeworksCompleted((Integer) analytics.get("totalCompleted"));
                request.setAverageScore((Double) analytics.get("averageScore"));
                request.setOnTimeSubmissions((Integer) analytics.get("onTimeSubmissions"));
                request.setLateSubmissions((Integer) analytics.get("lateSubmissions"));
                request.setHomeworkCompletionRate((Double) analytics.get("completionRate"));
            }
            
            // Create report entity
            Report report = new Report();
            report.setTitle(request.getTitle());
            report.setDescription(request.getDescription());
            report.setStudentId(request.getStudentId());
            report.setTeacherId(teacher.getId());
            report.setClassId(request.getClassId());
            report.setReportDate(request.getReportDate() != null ? request.getReportDate() : LocalDateTime.now());
            report.setOverallGrade(request.getOverallGrade());
            report.setHomeworkCompletionRate(request.getHomeworkCompletionRate());
            report.setAverageScore(request.getAverageScore());
            report.setTotalHomeworksAssigned(request.getTotalHomeworksAssigned());
            report.setTotalHomeworksCompleted(request.getTotalHomeworksCompleted());
            report.setOnTimeSubmissions(request.getOnTimeSubmissions());
            report.setLateSubmissions(request.getLateSubmissions());
            report.setStrengths(request.getStrengths());
            report.setAreasForImprovement(request.getAreasForImprovement());
            report.setTeacherNotes(request.getTeacherNotes());
            report.setRecommendations(request.getRecommendations());
            
            // Save report
            Report savedReport = reportRepository.save(report);
            
            // Convert to response DTO
            ReportResponse response = ReportResponse.fromEntity(savedReport);
            response.setStudentName(student.getFirstName() + " " + student.getLastName());
            response.setStudentEmail(student.getEmail());
            response.setTeacherName(teacher.getFirstName() + " " + teacher.getLastName());
            response.setClassName(classEntity.getClassName());
            response.setSubject(classEntity.getSubject());
            response.setGradeLevel(classEntity.getGradeLevel());
            
            logger.info("Created report for student {} in class {} by teacher {}", 
                       student.getId(), classEntity.getId(), teacher.getId());
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error creating report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create report: " + e.getMessage());
        }
    }
    
    /**
     * Get reports by teacher
     */
    public List<ReportResponse> getReportsByTeacher(String teacherEmail) {
        try {
            User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            List<Report> reports = reportRepository.findByTeacherId(teacher.getId());
            
            return reports.stream()
                .map(report -> enrichReportResponse(report))
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error fetching reports by teacher: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch reports: " + e.getMessage());
        }
    }
    
    /**
     * Get reports by teacher and class
     */
    public List<ReportResponse> getReportsByTeacherAndClass(String teacherEmail, Long classId) {
        try {
            User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            List<Report> reports = reportRepository.findByTeacherIdAndClassId(teacher.getId(), classId);
            
            return reports.stream()
                .map(report -> enrichReportResponse(report))
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error fetching reports by teacher and class: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch reports: " + e.getMessage());
        }
    }
    
    /**
     * Get reports by student
     */
    public List<ReportResponse> getReportsByStudent(String studentEmail) {
        try {
            User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));
            
            List<Report> reports = reportRepository.findByStudentId(student.getId());
            
            return reports.stream()
                .map(report -> enrichReportResponse(report))
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error fetching published reports by student: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch reports: " + e.getMessage());
        }
    }
    
    /**
     * Get report by ID
     */
    public ReportResponse getReportById(Long reportId, String userEmail) {
        try {
            Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
            
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check access permissions
            if (user.getRole() == UserRole.STUDENT) {
                if (!report.getStudentId().equals(user.getId())) {
                    throw new RuntimeException("Access denied");
                }
            } else if (user.getRole() == UserRole.TEACHER) {
                if (!report.getTeacherId().equals(user.getId())) {
                    throw new RuntimeException("Access denied");
                }
            }
            
            return enrichReportResponse(report);
            
        } catch (Exception e) {
            logger.error("Error fetching report by ID: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch report: " + e.getMessage());
        }
    }
    
    /**
     * Update report
     */
    public ReportResponse updateReport(Long reportId, ReportRequest request, String teacherEmail) {
        try {
            User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
            
            // Verify teacher owns this report
            if (!report.getTeacherId().equals(teacher.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            // Update fields
            if (request.getTitle() != null) report.setTitle(request.getTitle());
            if (request.getDescription() != null) report.setDescription(request.getDescription());
            if (request.getOverallGrade() != null) report.setOverallGrade(request.getOverallGrade());
            if (request.getStrengths() != null) report.setStrengths(request.getStrengths());
            if (request.getAreasForImprovement() != null) report.setAreasForImprovement(request.getAreasForImprovement());
            if (request.getTeacherNotes() != null) report.setTeacherNotes(request.getTeacherNotes());
            if (request.getRecommendations() != null) report.setRecommendations(request.getRecommendations());

            
            Report updatedReport = reportRepository.save(report);
            
            return enrichReportResponse(updatedReport);
            
        } catch (Exception e) {
            logger.error("Error updating report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update report: " + e.getMessage());
        }
    }
    
    /**
     * Delete report
     */
    public void deleteReport(Long reportId, String teacherEmail) {
        try {
            User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
            
            // Verify teacher owns this report
            if (!report.getTeacherId().equals(teacher.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            reportRepository.delete(report);
            
            logger.info("Deleted report {} by teacher {}", reportId, teacher.getId());
            
        } catch (Exception e) {
            logger.error("Error deleting report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete report: " + e.getMessage());
        }
    }
    
    /**
     * Calculate student analytics for a specific class
     */
    private Map<String, Object> calculateStudentAnalytics(Long studentId, Long classId) {
        Map<String, Object> analytics = new HashMap<>();
        
        try {
            // Get all homeworks for this class
            List<Homework> homeworks = homeworkRepository.findByClassId(classId, Sort.unsorted());
            int totalAssigned = homeworks.size();
            
            // Get all submissions for this student in this class
            List<HomeworkSubmission> submissions = submissionRepository.findByStudentId(studentId);
            
            // Filter submissions for homeworks in this class
            List<HomeworkSubmission> classSubmissions = submissions.stream()
                .filter(sub -> homeworks.stream().anyMatch(hw -> hw.getId().equals(sub.getHomeworkId())))
                .collect(Collectors.toList());
            
            int totalCompleted = classSubmissions.size();
            int onTimeSubmissions = (int) classSubmissions.stream()
                .filter(sub -> !sub.isLate())
                .count();
            int lateSubmissions = totalCompleted - onTimeSubmissions;
            
            // Calculate average score
            double averageScore = 0.0;
            if (totalCompleted > 0) {
                double totalScore = classSubmissions.stream()
                    .filter(sub -> sub.getGrade() != null)
                    .mapToDouble(HomeworkSubmission::getGrade)
                    .sum();
                int gradedCount = (int) classSubmissions.stream()
                    .filter(sub -> sub.getGrade() != null)
                    .count();
                if (gradedCount > 0) {
                    averageScore = totalScore / gradedCount;
                }
            }
            
            // Calculate completion rate
            double completionRate = totalAssigned > 0 ? (double) totalCompleted / totalAssigned * 100.0 : 0.0;
            
            analytics.put("totalAssigned", totalAssigned);
            analytics.put("totalCompleted", totalCompleted);
            analytics.put("onTimeSubmissions", onTimeSubmissions);
            analytics.put("lateSubmissions", lateSubmissions);
            analytics.put("averageScore", averageScore);
            analytics.put("completionRate", completionRate);
            
        } catch (Exception e) {
            logger.error("Error calculating student analytics: {}", e.getMessage(), e);
            // Set default values
            analytics.put("totalAssigned", 0);
            analytics.put("totalCompleted", 0);
            analytics.put("onTimeSubmissions", 0);
            analytics.put("lateSubmissions", 0);
            analytics.put("averageScore", 0.0);
            analytics.put("completionRate", 0.0);
        }
        
        return analytics;
    }
    
    /**
     * Enrich report response with additional information
     */
    private ReportResponse enrichReportResponse(Report report) {
        ReportResponse response = ReportResponse.fromEntity(report);
        
        try {
            // Get student information
            User student = userRepository.findById(report.getStudentId()).orElse(null);
            if (student != null) {
                response.setStudentName(student.getFirstName() + " " + student.getLastName());
                response.setStudentEmail(student.getEmail());
            }
            
            // Get teacher information
            User teacher = userRepository.findById(report.getTeacherId()).orElse(null);
            if (teacher != null) {
                response.setTeacherName(teacher.getFirstName() + " " + teacher.getLastName());
            }
            
            // Get class information
            Class classEntity = classRepository.findById(report.getClassId()).orElse(null);
            if (classEntity != null) {
                response.setClassName(classEntity.getClassName());
                response.setSubject(classEntity.getSubject());
                response.setGradeLevel(classEntity.getGradeLevel());
            }
            
        } catch (Exception e) {
            logger.error("Error enriching report response: {}", e.getMessage(), e);
        }
        
        return response;
    }
    
    /**
     * Get students for a specific class (only for assigned teachers)
     */
    public List<Map<String, Object>> getStudentsForClass(Long classId, String teacherEmail) {
        try {
            // Find teacher by email
            User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            // Verify teacher role
            if (teacher.getRole() != UserRole.TEACHER) {
                throw new RuntimeException("User is not a teacher");
            }
            
            // Find class
            Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
            
            // Verify teacher is assigned to this class
            if (classEntity.getTeacher() == null || !classEntity.getTeacher().getId().equals(teacher.getId())) {
                throw new RuntimeException("Teacher is not assigned to this class");
            }
            
            // Get enrolled students for this class
            List<com.homework.entity.Enrollment> enrollments = enrollmentRepository
                .findByClassEntityIdAndStatus(classId, com.homework.entity.Enrollment.EnrollmentStatus.ACTIVE);
            
            List<Map<String, Object>> students = new ArrayList<>();
            for (com.homework.entity.Enrollment enrollment : enrollments) {
                User student = enrollment.getStudent();
                Map<String, Object> studentInfo = new HashMap<>();
                studentInfo.put("id", student.getId());
                studentInfo.put("firstName", student.getFirstName());
                studentInfo.put("lastName", student.getLastName());
                studentInfo.put("email", student.getEmail());
                studentInfo.put("enrollmentDate", enrollment.getEnrollmentDate());
                students.add(studentInfo);
            }
            
            return students;
            
        } catch (Exception e) {
            logger.error("Error getting students for class: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get students for class: " + e.getMessage());
        }
    }

    /**
     * Generate PDF report for student download
     */
    public byte[] generatePdfReport(Long reportId, String studentEmail) {
        try {
            // Find student by email
            User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // Verify student role
            if (student.getRole() != UserRole.STUDENT) {
                throw new RuntimeException("User is not a student");
            }
            
            // Find report
            Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
            
            // Verify student can only access their own reports
            if (!report.getStudentId().equals(student.getId())) {
                throw new RuntimeException("Access denied: Student can only view their own reports");
            }
            
            // Generate PDF using PDFBox
            return generatePdfWithPdfBox(report, student);
            
        } catch (Exception e) {
            logger.error("Error generating PDF report: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage());
        }
    }
    
    /**
     * Generate PDF using PDFBox library
     */
    private byte[] generatePdfWithPdfBox(Report report, User student) throws IOException {
        try (PDDocument document = new PDDocument()) {
            // Get additional information
            Class classEntity = classRepository.findById(report.getClassId()).orElse(null);
            User teacher = userRepository.findById(report.getTeacherId()).orElse(null);
            
            // Set up fonts
            PDType1Font titleFont = PDType1Font.HELVETICA_BOLD;
            PDType1Font headerFont = PDType1Font.HELVETICA_BOLD;
            PDType1Font bodyFont = PDType1Font.HELVETICA;
            
            // Create first page
            PDPage page = new PDPage();
            document.addPage(page);
            
            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            float yPosition = 750;
            float leftMargin = 50;
            
            try {
                // Title
                contentStream.beginText();
                contentStream.setFont(titleFont, 20);
                contentStream.setNonStrokingColor(13, 148, 136); // Teal color
                contentStream.newLineAtOffset(leftMargin, yPosition);
                contentStream.showText("STUDENT ACADEMIC REPORT");
                contentStream.endText();
                
                yPosition -= 40;
                
                // Student Information Section
                contentStream.beginText();
                contentStream.setFont(headerFont, 14);
                contentStream.setNonStrokingColor(0, 0, 0);
                contentStream.newLineAtOffset(leftMargin, yPosition);
                contentStream.showText("Student Information");
                contentStream.endText();
                
                yPosition -= 25;
                
                contentStream.beginText();
                contentStream.setFont(bodyFont, 12);
                contentStream.newLineAtOffset(leftMargin, yPosition);
                contentStream.showText("Name: " + student.getFirstName() + " " + student.getLastName());
                contentStream.endText();
                
                yPosition -= 20;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(leftMargin, yPosition);
                contentStream.showText("Email: " + student.getEmail());
                contentStream.endText();
                
                yPosition -= 20;
                
                if (classEntity != null) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Class: " + classEntity.getClassName());
                    contentStream.endText();
                    
                    yPosition -= 20;
                    
                    contentStream.beginText();
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Subject: " + classEntity.getSubject());
                    contentStream.endText();
                    
                    yPosition -= 20;
                    
                    contentStream.beginText();
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Grade Level: " + classEntity.getGradeLevel());
                    contentStream.endText();
                    
                    yPosition -= 20;
                }
                
                if (teacher != null) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Teacher: " + teacher.getFirstName() + " " + teacher.getLastName());
                    contentStream.endText();
                    
                    yPosition -= 20;
                }
                
                yPosition -= 20;
                
                // Report Details Section
                contentStream.beginText();
                contentStream.setFont(headerFont, 14);
                contentStream.newLineAtOffset(leftMargin, yPosition);
                contentStream.showText("Report Details");
                contentStream.endText();
                
                yPosition -= 25;
                
                contentStream.beginText();
                contentStream.setFont(bodyFont, 12);
                contentStream.newLineAtOffset(leftMargin, yPosition);
                contentStream.showText("Title: " + report.getTitle());
                contentStream.endText();
                
                yPosition -= 20;
                
                contentStream.beginText();
                contentStream.newLineAtOffset(leftMargin, yPosition);
                contentStream.showText("Overall Grade: " + (report.getOverallGrade() != null ? report.getOverallGrade() : "N/A"));
                contentStream.endText();
                
                yPosition -= 20;
                
                if (report.getDescription() != null && !report.getDescription().isEmpty()) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText("Description: " + report.getDescription());
                    contentStream.endText();
                    
                    yPosition -= 20;
                }
                
                // Add sections with simplified approach
                yPosition = addTextSection(contentStream, yPosition, leftMargin, headerFont, bodyFont, 
                                         "Strengths", report.getStrengths());
                yPosition = addTextSection(contentStream, yPosition, leftMargin, headerFont, bodyFont, 
                                         "Areas for Improvement", report.getAreasForImprovement());
                yPosition = addTextSection(contentStream, yPosition, leftMargin, headerFont, bodyFont, 
                                         "Teacher Notes", report.getTeacherNotes());
                yPosition = addTextSection(contentStream, yPosition, leftMargin, headerFont, bodyFont, 
                                         "Recommendations", report.getRecommendations());
                
                // Footer
                yPosition -= 30;
                contentStream.beginText();
                contentStream.setFont(bodyFont, 10);
                contentStream.setNonStrokingColor(100, 100, 100);
                contentStream.newLineAtOffset(leftMargin, yPosition);
                contentStream.showText("Generated on: " + java.time.LocalDateTime.now().toString());
                contentStream.endText();
                
            } finally {
                contentStream.close();
            }
            
            // Convert to byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
    
    /**
     * Helper method to add a text section to the PDF (simplified version)
     */
    private float addTextSection(PDPageContentStream contentStream, float yPosition, 
                                float leftMargin, PDType1Font headerFont, PDType1Font bodyFont,
                                String sectionTitle, String sectionContent) throws IOException {
        if (sectionContent != null && !sectionContent.isEmpty() && yPosition > 100) {
            contentStream.beginText();
            contentStream.setFont(headerFont, 14);
            contentStream.newLineAtOffset(leftMargin, yPosition);
            contentStream.showText(sectionTitle);
            contentStream.endText();
            
            yPosition -= 25;
            
            // Split long text into multiple lines (simple approach)
            String[] lines = splitTextIntoLines(sectionContent, 80);
            for (String line : lines) {
                if (yPosition > 50) {
                    contentStream.beginText();
                    contentStream.setFont(bodyFont, 12);
                    contentStream.newLineAtOffset(leftMargin, yPosition);
                    contentStream.showText(line);
                    contentStream.endText();
                    yPosition -= 20;
                } else {
                    break; // Stop if we run out of space
                }
            }
            
            yPosition -= 10;
        }
        
        return yPosition;
    }
    
    /**
     * Split text into lines for PDF formatting
     */
    private String[] splitTextIntoLines(String text, int maxLineLength) {
        if (text == null || text.isEmpty()) {
            return new String[0];
        }
        
        // Simple word wrapping
        String[] words = text.split("\\s+");
        List<String> lines = new ArrayList<>();
        StringBuilder currentLine = new StringBuilder();
        
        for (String word : words) {
            if (currentLine.length() + word.length() + 1 <= maxLineLength) {
                if (currentLine.length() > 0) {
                    currentLine.append(" ");
                }
                currentLine.append(word);
            } else {
                if (currentLine.length() > 0) {
                    lines.add(currentLine.toString());
                    currentLine = new StringBuilder(word);
                } else {
                    // Word is longer than max line length, add it anyway
                    lines.add(word);
                }
            }
        }
        
        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }
        
        return lines.toArray(new String[0]);
    }
}
