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




    @PostMapping("/upload")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get("/Volumes/External_01/ASH/Projects/Homework Application for Primary Education/backend/uploads/profile-pictures");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
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

            logger.info("Profile picture uploaded successfully: {}", filename);

            return ResponseEntity.ok().body("Profile picture uploaded successfully: " + filename);

        } catch (IOException e) {
            logger.error("Error uploading profile picture", e);
            return ResponseEntity.internalServerError().body("Failed to upload profile picture");
        }
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> serveProfilePicture(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get("/Volumes/External_01/ASH/Projects/Homework Application for Primary Education/backend/uploads/profile-pictures").resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(fileName);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            logger.error("Malformed URL exception for file: {}", fileName, ex);
            return ResponseEntity.badRequest().build();
        }
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
