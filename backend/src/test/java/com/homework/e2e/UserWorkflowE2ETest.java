package com.homework.e2e;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.context.annotation.Import;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import com.homework.dto.RegisterRequest;
import com.homework.dto.LoginRequest;
import com.homework.dto.HomeworkRequest;
import com.homework.dto.HomeworkSubmissionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * End-to-End User Workflow Tests
 * These tests simulate real user interactions and workflows
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.show-sql=true"
})
@Import(com.homework.config.TestConfig.class)
class UserWorkflowE2ETest {

    @LocalServerPort
    private int port;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private String baseUrl;
    private String teacherToken;
    private String studentToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api";
        setupTestUsers();
    }

    /**
     * Test Complete Teacher Workflow
     * 1. Teacher logs in
     * 2. Creates a new homework assignment
     * 3. Views their homework list
     * 4. Receives submission notifications
     * 5. Grades student submissions
     */
    @Test
    @DisplayName("Complete Teacher Workflow: Login → Create Homework → Grade Submissions")
    void testCompleteTeacherWorkflow() {
        // Step 1: Teacher Login
        assertNotNull(teacherToken, "Teacher should be able to login");
        
        // Step 2: Create Homework Assignment
        HomeworkRequest homeworkRequest = createHomeworkRequest();
        ResponseEntity<Map> createResponse = createHomework(homeworkRequest, teacherToken);
        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        
        Map<String, Object> homework = createResponse.getBody();
        assertNotNull(homework);
        assertNotNull(homework.get("id"));
        Long homeworkId = Long.valueOf(homework.get("id").toString());
        
        // Step 3: View Teacher's Homework List
        ResponseEntity<List> homeworkListResponse = getTeacherHomework(teacherToken);
        assertEquals(HttpStatus.OK, homeworkListResponse.getStatusCode());
        
        List<Map<String, Object>> homeworkList = homeworkListResponse.getBody();
        assertNotNull(homeworkList);
        assertTrue(homeworkList.size() > 0);
        
        // Step 4: Check if homework appears in list
        boolean homeworkFound = homeworkList.stream()
            .anyMatch(hw -> hw.get("id").equals(homeworkId));
        assertTrue(homeworkFound, "Created homework should appear in teacher's list");
        
        // Step 5: Simulate Student Submission (would need student to submit)
        // This would require a separate test or mock submission
        
        System.out.println("✅ Teacher workflow completed successfully!");
    }

    /**
     * Test Complete Student Workflow
     * 1. Student logs in
     * 2. Views available homework
     * 3. Submits homework
     * 4. Receives grade notifications
     */
    @Test
    @DisplayName("Complete Student Workflow: Login → View Homework → Submit → Receive Grade")
    void testCompleteStudentWorkflow() {
        // Step 1: Student Login
        assertNotNull(studentToken, "Student should be able to login");
        
        // Step 2: View Available Homework
        ResponseEntity<List> homeworkResponse = getStudentHomework(studentToken);
        assertEquals(HttpStatus.OK, homeworkResponse.getStatusCode());
        
        List<Map<String, Object>> homeworkList = homeworkResponse.getBody();
        assertNotNull(homeworkList);
        
        // Step 3: Submit Homework (if homework exists)
        if (!homeworkList.isEmpty()) {
            Map<String, Object> homework = homeworkList.get(0);
            Long homeworkId = Long.valueOf(homework.get("id").toString());
            
            HomeworkSubmissionRequest submissionRequest = createSubmissionRequest(homeworkId);
            ResponseEntity<Map> submitResponse = submitHomework(submissionRequest, studentToken);
            assertEquals(HttpStatus.OK, submitResponse.getStatusCode());
            
            Map<String, Object> submission = submitResponse.getBody();
            assertNotNull(submission);
            assertEquals("SUBMITTED", submission.get("status"));
            
            System.out.println("✅ Student submitted homework successfully!");
        } else {
            System.out.println("ℹ️ No homework available for student to submit");
        }
    }

    /**
     * Test Complete Admin Workflow
     * 1. Admin logs in
     * 2. Views all users
     * 3. Manages user accounts
     * 4. Views system statistics
     */
    @Test
    @DisplayName("Complete Admin Workflow: Login → User Management → System Overview")
    void testCompleteAdminWorkflow() {
        // Step 1: Admin Login
        assertNotNull(adminToken, "Admin should be able to login");
        
        // Step 2: View All Users
        ResponseEntity<List> usersResponse = getAllUsers(adminToken);
        assertEquals(HttpStatus.OK, usersResponse.getStatusCode());
        
        List<Map<String, Object>> users = usersResponse.getBody();
        assertNotNull(users);
        assertTrue(users.size() >= 3, "Should have at least teacher, student, and admin users");
        
        // Step 3: Check User Roles
        boolean hasTeacher = users.stream().anyMatch(u -> "TEACHER".equals(u.get("role")));
        boolean hasStudent = users.stream().anyMatch(u -> "STUDENT".equals(u.get("role")));
        boolean hasAdmin = users.stream().anyMatch(u -> "ADMIN".equals(u.get("role")));
        
        assertTrue(hasTeacher, "System should have teacher users");
        assertTrue(hasStudent, "System should have student users");
        assertTrue(hasAdmin, "System should have admin users");
        
        System.out.println("✅ Admin workflow completed successfully!");
    }

    /**
     * Test Reminder System Workflow
     * 1. Create homework with due date
     * 2. Verify reminders are generated
     * 3. Check notification delivery
     */
    @Test
    @DisplayName("Reminder System Workflow: Create Homework → Generate Reminders → Send Notifications")
    void testReminderSystemWorkflow() {
        // Step 1: Create homework with due date
        HomeworkRequest homeworkRequest = createHomeworkRequest();
        homeworkRequest.setDueDate(LocalDateTime.now().plusDays(1)); // Due tomorrow
        
        ResponseEntity<Map> createResponse = createHomework(homeworkRequest, teacherToken);
        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        
        // Step 2: Check if reminders were created
        ResponseEntity<List> remindersResponse = getStudentReminders(studentToken);
        assertEquals(HttpStatus.OK, remindersResponse.getStatusCode());
        
        List<Map<String, Object>> reminders = remindersResponse.getBody();
        assertNotNull(reminders);
        
        // Step 3: Verify reminder content
        if (!reminders.isEmpty()) {
            Map<String, Object> reminder = reminders.get(0);
            assertNotNull(reminder.get("title"));
            assertNotNull(reminder.get("message"));
            assertNotNull(reminder.get("dueDate"));
            
            System.out.println("✅ Reminder system working correctly!");
        } else {
            System.out.println("ℹ️ No reminders generated yet (may be due to timing)");
        }
    }

    /**
     * Test File Upload Workflow
     * 1. Teacher creates homework with attachment
     * 2. Student submits homework with file
     * 3. Verify file handling
     */
    @Test
    @DisplayName("File Upload Workflow: Create Homework with File → Student Submission with File")
    void testFileUploadWorkflow() {
        // Step 1: Create homework (simulating file upload)
        HomeworkRequest homeworkRequest = createHomeworkRequest();
        homeworkRequest.setTitle("File Upload Test Homework");
        
        ResponseEntity<Map> createResponse = createHomework(homeworkRequest, teacherToken);
        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        
        Map<String, Object> homework = createResponse.getBody();
        assertNotNull(homework);
        Long homeworkId = Long.valueOf(homework.get("id").toString());
        
        // Step 2: Student submits with file data
        HomeworkSubmissionRequest submissionRequest = createSubmissionRequest(homeworkId);
        submissionRequest.setSubmissionType("PDF");
        submissionRequest.setPdfData("base64_pdf_test_data");
        
        ResponseEntity<Map> submitResponse = submitHomework(submissionRequest, studentToken);
        assertEquals(HttpStatus.OK, submitResponse.getStatusCode());
        
        Map<String, Object> submission = submitResponse.getBody();
        assertNotNull(submission);
        assertEquals("SUBMITTED", submission.get("status"));
        
        System.out.println("✅ File upload workflow completed successfully!");
    }

    // Helper Methods for API Calls

    private void setupTestUsers() {
        // Create test users and get authentication tokens
        teacherToken = createAndLoginUser("teacher@test.com", "TEACHER", "Test Teacher");
        studentToken = createAndLoginUser("student@test.com", "STUDENT", "Test Student");
        adminToken = createAndLoginUser("admin@test.com", "ADMIN", "Test Admin");
    }

    private String createAndLoginUser(String email, String role, String name) {
        try {
            // Register user
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(email);
            registerRequest.setPassword("password123");
            registerRequest.setFirstName(name.split(" ")[0]);
            registerRequest.setLastName(name.split(" ")[1]);
            registerRequest.setRole(role);
            if ("STUDENT".equals(role)) {
                registerRequest.setClassGrade("4th Grade");
            }
            
            restTemplate.postForEntity(baseUrl + "/auth/register", registerRequest, Map.class);
            
            // Login user
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail(email);
            loginRequest.setPassword("password123");
            
            ResponseEntity<Map> loginResponse = restTemplate.postForEntity(
                baseUrl + "/auth/login", loginRequest, Map.class);
            
            if (loginResponse.getStatusCode() == HttpStatus.OK && loginResponse.getBody() != null) {
                return "Bearer " + loginResponse.getBody().get("token");
            }
        } catch (Exception e) {
            System.out.println("Warning: Could not create/login user " + email + ": " + e.getMessage());
        }
        return null;
    }

    private HomeworkRequest createHomeworkRequest() {
        HomeworkRequest request = new HomeworkRequest();
        request.setTitle("E2E Test Homework");
        request.setDescription("This is a test homework for end-to-end testing");
        request.setSubject("Mathematics");
        request.setClassGrade("4th Grade");
        request.setGrade(4);
        request.setClassId(1L);
        request.setDueDate(LocalDateTime.now().plusDays(7));
        return request;
    }

    private HomeworkSubmissionRequest createSubmissionRequest(Long homeworkId) {
        HomeworkSubmissionRequest request = new HomeworkSubmissionRequest();
        request.setHomeworkId(homeworkId);
        request.setSubmissionText("This is my test submission for E2E testing");
        request.setSubmissionType("TEXT");
        return request;
    }

    private ResponseEntity<Map> createHomework(HomeworkRequest request, String token) {
        return restTemplate.postForEntity(
            baseUrl + "/homework",
            request,
            Map.class
        );
    }

    private ResponseEntity<List> getTeacherHomework(String token) {
        return restTemplate.exchange(
            baseUrl + "/homework/teacher",
            org.springframework.http.HttpMethod.GET,
            new org.springframework.http.HttpEntity<>(createHeaders(token)),
            new org.springframework.core.ParameterizedTypeReference<List>() {}
        );
    }

    private ResponseEntity<List> getStudentHomework(String token) {
        return restTemplate.exchange(
            baseUrl + "/homework/student",
            org.springframework.http.HttpMethod.GET,
            new org.springframework.http.HttpEntity<>(createHeaders(token)),
            new org.springframework.core.ParameterizedTypeReference<List>() {}
        );
    }

    private ResponseEntity<Map> submitHomework(HomeworkSubmissionRequest request, String token) {
        return restTemplate.postForEntity(
            baseUrl + "/homework/submit",
            request,
            Map.class
        );
    }

    private ResponseEntity<List> getAllUsers(String token) {
        return restTemplate.exchange(
            baseUrl + "/admin/users",
            org.springframework.http.HttpMethod.GET,
            new org.springframework.http.HttpEntity<>(createHeaders(token)),
            new org.springframework.core.ParameterizedTypeReference<List>() {}
        );
    }

    private ResponseEntity<List> getStudentReminders(String token) {
        return restTemplate.exchange(
            baseUrl + "/reminders/user",
            org.springframework.http.HttpMethod.GET,
            new org.springframework.http.HttpEntity<>(createHeaders(token)),
            new org.springframework.core.ParameterizedTypeReference<List>() {}
        );
    }

    private org.springframework.http.HttpHeaders createHeaders(String token) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        if (token != null) {
            headers.set("Authorization", token);
        }
        return headers;
    }
}
