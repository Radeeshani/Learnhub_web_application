package com.homework.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/profile-pictures")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProfilePictureController {

    private static final Logger logger = LoggerFactory.getLogger(ProfilePictureController.class);

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> serveProfilePicture(@PathVariable String fileName) {
        try {
            logger.debug("Attempting to serve profile picture: {}", fileName);
            
            // Try multiple possible paths for the uploads directory
            Path filePath = null;
            Resource resource = null;
            
            // Method 1: Try relative to current working directory
            Path currentDir = Paths.get("").toAbsolutePath();
            Path uploadsDir1 = currentDir.resolve("uploads").resolve("profile-pictures");
            Path filePath1 = uploadsDir1.resolve(fileName);
            
            logger.debug("Current directory: {}", currentDir);
            logger.debug("Uploads directory (method 1): {}", uploadsDir1);
            logger.debug("File path (method 1): {}", filePath1);
            
            if (Files.exists(filePath1)) {
                filePath = filePath1;
                resource = new UrlResource(filePath.toUri());
                logger.debug("Profile picture found using method 1: {}", filePath);
            } else {
                // Method 2: Try relative to project root (backend directory)
                Path projectRoot = currentDir.getParent();
                if (projectRoot != null) {
                    Path uploadsDir2 = projectRoot.resolve("uploads").resolve("profile-pictures");
                    Path filePath2 = uploadsDir2.resolve(fileName);
                    
                    logger.debug("Project root: {}", projectRoot);
                    logger.debug("Uploads directory (method 2): {}", uploadsDir2);
                    logger.debug("File path (method 2): {}", filePath2);
                    
                    if (Files.exists(filePath2)) {
                        filePath = filePath2;
                        resource = new UrlResource(filePath.toUri());
                        logger.debug("Profile picture found using method 2: {}", filePath);
                    }
                }
                
                // Method 3: Try absolute path to project directory
                if (filePath == null) {
                    Path absolutePath = Paths.get("/Volumes/External_01/ASH/Projects/Homework Application for Primary Education/uploads/profile-pictures");
                    Path filePath3 = absolutePath.resolve(fileName);
                    
                    logger.debug("Absolute path: {}", absolutePath);
                    logger.debug("File path (method 3): {}", filePath3);
                    
                    if (Files.exists(filePath3)) {
                        filePath = filePath3;
                        resource = new UrlResource(filePath.toUri());
                        logger.debug("Profile picture found using method 3: {}", filePath);
                    }
                }
            }

            if (resource != null && resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(fileName);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
            } else {
                logger.warn("Profile picture not found or not readable. Tried all methods.");
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            logger.error("Malformed URL exception for profile picture: {}", fileName, ex);
            return ResponseEntity.badRequest().build();
        } catch (Exception ex) {
            logger.error("Error serving profile picture: {}", fileName, ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            // Use the same path resolution logic as the GET method
            Path uploadPath = null;
            
            // Method 1: Try relative to current working directory
            Path currentDir = Paths.get("").toAbsolutePath();
            Path uploadPath1 = currentDir.resolve("uploads").resolve("profile-pictures");
            
            if (Files.exists(uploadPath1)) {
                uploadPath = uploadPath1;
                logger.debug("Using upload path (method 1): {}", uploadPath);
            } else {
                // Method 2: Try relative to project root (backend directory)
                Path projectRoot = currentDir.getParent();
                if (projectRoot != null) {
                    Path uploadPath2 = projectRoot.resolve("uploads").resolve("profile-pictures");
                    
                    if (Files.exists(uploadPath2)) {
                        uploadPath = uploadPath2;
                        logger.debug("Using upload path (method 2): {}", uploadPath);
                    }
                }
                
                // Method 3: Use absolute path to project directory
                if (uploadPath == null) {
                    uploadPath = Paths.get("/Volumes/External_01/ASH/Projects/Homework Application for Primary Education/uploads/profile-pictures");
                    logger.debug("Using upload path (method 3): {}", uploadPath);
                }
            }
            
            // Create upload directory if it doesn't exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Created upload directory: {}", uploadPath);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            logger.info("Profile picture uploaded successfully: {} to {}", filename, filePath);

            return ResponseEntity.ok().body("Profile picture uploaded successfully: " + filename);

        } catch (IOException e) {
            logger.error("Error uploading profile picture", e);
            return ResponseEntity.internalServerError().body("Failed to upload profile picture");
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Profile picture controller test endpoint called");
        return ResponseEntity.ok("Profile picture controller is working!");
    }

    private String determineContentType(String fileName) {
        fileName = fileName.toLowerCase();
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else if (fileName.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "application/octet-stream";
        }
    }
}
