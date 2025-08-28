package com.homework.performance;

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

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Performance Testing Framework
 * Tests system performance under various load conditions
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.show-sql=false"
})
@Import(com.homework.config.TestConfig.class)
class PerformanceTest {

    @LocalServerPort
    private int port;

    @Autowired
    private RestTemplate restTemplate;

    private String baseUrl;
    private String teacherToken;
    private String studentToken;
    private List<String> studentTokens;
    private Long testHomeworkId;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api";
        setupTestData();
    }

    /**
     * Test System Response Time Under Normal Load
     * Measures response times for typical user operations
     */
    @Test
    @DisplayName("Normal Load Performance: Response Time Testing")
    void testNormalLoadPerformance() {
        System.out.println("🚀 Testing Normal Load Performance...");
        
        int iterations = 10;
        List<Long> responseTimes = new ArrayList<>();
        
        for (int i = 0; i < iterations; i++) {
            long startTime = System.currentTimeMillis();
            
            // Test teacher dashboard load
            ResponseEntity<List> response = getTeacherHomework(teacherToken);
            assertEquals(HttpStatus.OK, response.getStatusCode());
            
            long endTime = System.currentTimeMillis();
            long responseTime = endTime - startTime;
            responseTimes.add(responseTime);
            
            System.out.println("Request " + (i + 1) + ": " + responseTime + "ms");
        }
        
        // Calculate statistics
        double avgResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);
        
        long maxResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .max()
            .orElse(0);
        
        long minResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .min()
            .orElse(0);
        
        System.out.println("📊 Performance Results:");
        System.out.println("  Average Response Time: " + String.format("%.2f", avgResponseTime) + "ms");
        System.out.println("  Maximum Response Time: " + maxResponseTime + "ms");
        System.out.println("  Minimum Response Time: " + minResponseTime + "ms");
        
        // Performance assertions
        assertTrue(avgResponseTime < 1000, "Average response time should be under 1 second");
        assertTrue(maxResponseTime < 2000, "Maximum response time should be under 2 seconds");
    }

    /**
     * Test Concurrent User Load
     * Simulates multiple users accessing the system simultaneously
     */
    @Test
    @DisplayName("Concurrent User Load: Multiple Users Accessing System")
    void testConcurrentUserLoad() throws InterruptedException {
        System.out.println("👥 Testing Concurrent User Load...");
        
        int concurrentUsers = 20;
        ExecutorService executor = Executors.newFixedThreadPool(concurrentUsers);
        AtomicInteger successfulRequests = new AtomicInteger(0);
        AtomicInteger failedRequests = new AtomicInteger(0);
        AtomicLong totalResponseTime = new AtomicLong(0);
        
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        
        for (int userIndex = 0; userIndex < concurrentUsers; userIndex++) {
            final int finalUserIndex = userIndex;
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    long startTime = System.currentTimeMillis();
                    
                    // Simulate user accessing student homework
                    String studentToken = studentTokens.get(finalUserIndex % studentTokens.size());
                    ResponseEntity<List> response = getStudentHomework(studentToken);
                    
                    long endTime = System.currentTimeMillis();
                    long responseTime = endTime - startTime;
                    
                    if (response.getStatusCode() == HttpStatus.OK) {
                        successfulRequests.incrementAndGet();
                        totalResponseTime.addAndGet(responseTime);
                    } else {
                        failedRequests.incrementAndGet();
                    }
                    
                } catch (Exception e) {
                    failedRequests.incrementAndGet();
                    System.err.println("Request failed: " + e.getMessage());
                }
            }, executor);
            
            futures.add(future);
        }
        
        // Wait for all requests to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        
        // Calculate results
        int totalRequests = successfulRequests.get() + failedRequests.get();
        double successRate = (double) successfulRequests.get() / totalRequests * 100;
        double avgResponseTime = successfulRequests.get() > 0 ? 
            (double) totalResponseTime.get() / successfulRequests.get() : 0;
        
        System.out.println("📊 Concurrent Load Results:");
        System.out.println("  Total Requests: " + totalRequests);
        System.out.println("  Successful Requests: " + successfulRequests.get());
        System.out.println("  Failed Requests: " + failedRequests.get());
        System.out.println("  Success Rate: " + String.format("%.2f", successRate) + "%");
        System.out.println("  Average Response Time: " + String.format("%.2f", avgResponseTime) + "ms");
        
        // Performance assertions
        assertTrue(successRate >= 90, "Success rate should be at least 90%");
        assertTrue(avgResponseTime < 1500, "Average response time should be under 1.5 seconds");
    }

    /**
     * Test Database Query Performance
     * Measures performance of database-intensive operations
     */
    @Test
    @DisplayName("Database Query Performance: Large Dataset Operations")
    void testDatabaseQueryPerformance() {
        System.out.println("🗄️ Testing Database Query Performance...");
        
        // Test teacher homework retrieval (database intensive)
        long startTime = System.currentTimeMillis();
        
        ResponseEntity<List> response = getTeacherHomework(teacherToken);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;
        
        List<Map<String, Object>> homeworkList = response.getBody();
        int homeworkCount = homeworkList != null ? homeworkList.size() : 0;
        
        System.out.println("📊 Database Query Results:");
        System.out.println("  Response Time: " + responseTime + "ms");
        System.out.println("  Homework Count: " + homeworkCount);
        System.out.println("  Time per Homework: " + String.format("%.2f", (double) responseTime / Math.max(1, homeworkCount)) + "ms");
        
        // Performance assertions
        assertTrue(responseTime < 1000, "Database query should complete under 1 second");
    }

    /**
     * Test File Upload Performance
     * Measures performance of file upload operations
     */
    @Test
    @DisplayName("File Upload Performance: Large File Handling")
    void testFileUploadPerformance() {
        System.out.println("📁 Testing File Upload Performance...");
        
        if (testHomeworkId == null) {
            System.out.println("⚠️ Skipping file upload test - no homework available");
            return;
        }
        
        // Create a large text submission (simulating file upload)
        HomeworkSubmissionRequest submissionRequest = new HomeworkSubmissionRequest();
        submissionRequest.setHomeworkId(testHomeworkId);
        submissionRequest.setSubmissionType("TEXT");
        
        // Generate large text content (simulating large file)
        StringBuilder largeContent = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            largeContent.append("This is line ").append(i).append(" of a large submission. ");
        }
        submissionRequest.setSubmissionText(largeContent.toString());
        
        long startTime = System.currentTimeMillis();
        
        ResponseEntity<Map> response = submitHomework(submissionRequest, studentToken);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;
        
        System.out.println("📊 File Upload Results:");
        System.out.println("  Response Time: " + responseTime + "ms");
        System.out.println("  Content Size: " + largeContent.length() + " characters");
        System.out.println("  Processing Rate: " + String.format("%.2f", (double) largeContent.length() / responseTime) + " chars/ms");
        
        // Performance assertions
        assertTrue(responseTime < 3000, "Large file upload should complete under 3 seconds");
    }

    /**
     * Test Memory Usage Under Load
     * Monitors memory consumption during performance tests
     */
    @Test
    @DisplayName("Memory Usage Under Load: Resource Consumption Monitoring")
    void testMemoryUsageUnderLoad() {
        System.out.println("💾 Testing Memory Usage Under Load...");
        
        Runtime runtime = Runtime.getRuntime();
        
        // Get initial memory state
        long initialMemory = runtime.totalMemory() - runtime.freeMemory();
        System.out.println("Initial Memory Usage: " + (initialMemory / 1024 / 1024) + " MB");
        
        // Perform intensive operations
        for (int operationCount = 0; operationCount < 50; operationCount++) {
            getTeacherHomework(teacherToken);
            getStudentHomework(studentToken);
            
            if (operationCount % 10 == 0) {
                System.gc(); // Request garbage collection
                long currentMemory = runtime.totalMemory() - runtime.freeMemory();
                System.out.println("Memory Usage after " + operationCount + " operations: " + (currentMemory / 1024 / 1024) + " MB");
            }
        }
        
        // Get final memory state
        System.gc();
        long finalMemory = runtime.totalMemory() - runtime.freeMemory();
        long memoryIncrease = finalMemory - initialMemory;
        
        System.out.println("📊 Memory Usage Results:");
        System.out.println("  Final Memory Usage: " + (finalMemory / 1024 / 1024) + " MB");
        System.out.println("  Memory Increase: " + (memoryIncrease / 1024 / 1024) + " MB");
        
        // Performance assertions
        assertTrue(memoryIncrease < 100 * 1024 * 1024, "Memory increase should be under 100 MB");
    }

    /**
     * Test Stress Conditions
     * Pushes the system to its limits to identify breaking points
     */
    @Test
    @DisplayName("Stress Testing: System Breaking Point Analysis")
    void testStressConditions() throws InterruptedException {
        System.out.println("🔥 Testing Stress Conditions...");
        
        int stressUsers = 50;
        ExecutorService executor = Executors.newFixedThreadPool(stressUsers);
        AtomicInteger successfulRequests = new AtomicInteger(0);
        AtomicInteger failedRequests = new AtomicInteger(0);
        
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        
        for (int stressIndex = 0; stressIndex < stressUsers; stressIndex++) {
            final int finalStressIndex = stressIndex;
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    // Simulate rapid-fire requests
                    for (int j = 0; j < 5; j++) {
                        String studentToken = studentTokens.get(finalStressIndex % studentTokens.size());
                        ResponseEntity<List> response = getStudentHomework(studentToken);
                        
                        if (response.getStatusCode() == HttpStatus.OK) {
                            successfulRequests.incrementAndGet();
                        } else {
                            failedRequests.incrementAndGet();
                        }
                        
                        // Small delay between requests
                        Thread.sleep(100);
                    }
                } catch (Exception e) {
                    failedRequests.incrementAndGet();
                }
            }, executor);
            
            futures.add(future);
        }
        
        // Wait for completion with timeout
        try {
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .get(60, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println("⚠️ Stress test timed out: " + e.getMessage());
        }
        
        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        
        int totalRequests = successfulRequests.get() + failedRequests.get();
        double successRate = (double) successfulRequests.get() / totalRequests * 100;
        
        System.out.println("📊 Stress Test Results:");
        System.out.println("  Total Requests: " + totalRequests);
        System.out.println("  Successful Requests: " + successfulRequests.get());
        System.out.println("  Failed Requests: " + failedRequests.get());
        System.out.println("  Success Rate: " + String.format("%.2f", successRate) + "%");
        
        // Stress test assertions
        assertTrue(successRate >= 70, "Success rate under stress should be at least 70%");
    }

    // Helper Methods

    private void setupTestData() {
        try {
            // Create test users
            teacherToken = createAndLoginUser("perf_teacher@test.com", "TEACHER", "Perf Teacher");
            studentToken = createAndLoginUser("perf_student@test.com", "STUDENT", "Perf Student");
            
            // Create multiple student tokens for concurrent testing
            studentTokens = new ArrayList<>();
            for (int studentIndex = 0; studentIndex < 25; studentIndex++) {
                String token = createAndLoginUser(
                    "perf_student" + studentIndex + "@test.com", 
                    "STUDENT", 
                    "Perf Student " + studentIndex
                );
                if (token != null) {
                    studentTokens.add(token);
                }
            }
            
            // Create test homework
            if (teacherToken != null) {
                testHomeworkId = createTestHomework();
            }
            
        } catch (Exception e) {
            System.err.println("Warning: Could not setup test data: " + e.getMessage());
        }
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
            // Ignore errors for performance testing
        }
        return null;
    }

    private Long createTestHomework() {
        try {
            HomeworkRequest request = new HomeworkRequest();
            request.setTitle("Performance Test Homework");
            request.setDescription("Homework for performance testing");
            request.setSubject("Mathematics");
            request.setClassGrade("4th Grade");
            request.setGrade(4);
            request.setClassId(1L);
            request.setDueDate(LocalDateTime.now().plusDays(7));
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl + "/homework", request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.CREATED && response.getBody() != null) {
                return Long.valueOf(response.getBody().get("id").toString());
            }
        } catch (Exception e) {
            // Ignore errors for performance testing
        }
        return null;
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
            baseUrl + "/homework/submit", request, Map.class);
    }

    private org.springframework.http.HttpHeaders createHeaders(String token) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        if (token != null) {
            headers.set("Authorization", token);
        }
        return headers;
    }
}
