package com.homework.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("FileController test endpoint called");
        return ResponseEntity.ok("FileController is working!");
    }
    
    @GetMapping("/test-path")
    public ResponseEntity<Map<String, String>> testPath() {
        Path uploadsDir = Paths.get("backend/uploads/homework").toAbsolutePath().normalize();
        Map<String, String> response = new HashMap<>();
        response.put("uploadsDirectory", uploadsDir.toString());
        response.put("exists", String.valueOf(Files.exists(uploadsDir)));
        response.put("isDirectory", String.valueOf(Files.isDirectory(uploadsDir)));
        logger.info("FileController test-path endpoint called. Uploads dir: {}, exists: {}, isDirectory: {}", 
                   uploadsDir, Files.exists(uploadsDir), Files.isDirectory(uploadsDir));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/homework/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            logger.debug("Attempting to serve file: {}", fileName);
            
            // Use the same absolute path as HomeworkService for consistency
            Path uploadsDir = Paths.get("backend/uploads/homework").toAbsolutePath().normalize();
            Path filePath = uploadsDir.resolve(fileName);
            
            logger.debug("Uploads directory: {}", uploadsDir);
            logger.debug("File path: {}", filePath);
            logger.debug("File exists: {}", Files.exists(filePath));
            logger.debug("File is readable: {}", Files.isReadable(filePath));
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                logger.debug("File found and readable: {}", filePath);
                String contentType = determineContentType(fileName);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
            } else {
                logger.warn("File not found or not readable: {}", filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            logger.error("Malformed URL exception for file: {}", fileName, ex);
            return ResponseEntity.badRequest().build();
        } catch (Exception ex) {
            logger.error("Error serving file: {}", fileName, ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String fileName) {
        fileName = fileName.toLowerCase();
        if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else {
            return "application/octet-stream";
        }
    }
} 