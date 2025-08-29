package com.homework.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.homework.service.AudioConversionService;

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
    
    @Autowired
    private AudioConversionService audioConversionService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("FileController test endpoint called");
        return ResponseEntity.ok("FileController is working!");
    }
    
    @GetMapping("/test-path")
    public ResponseEntity<Map<String, String>> testPath() {
        Path uploadsDir = Paths.get("uploads/homework").toAbsolutePath().normalize();
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
            logger.info("Attempting to serve file: {}", fileName);
            
            // Use the correct path relative to the backend directory
            Path uploadsDir = Paths.get("uploads/homework").toAbsolutePath().normalize();
            Path filePath = uploadsDir.resolve(fileName);
            
            logger.info("Uploads directory: {}", uploadsDir);
            logger.info("File path: {}", filePath);
            logger.info("File exists: {}", Files.exists(filePath));
            logger.info("File is readable: {}", Files.isReadable(filePath));
            logger.info("Current working directory: {}", Paths.get("").toAbsolutePath());
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                logger.debug("File found and readable: {}", filePath);
                String contentType = determineContentType(fileName);
                Resource finalResource = resource;
                String finalFileName = fileName;
                
                // Check if the file is actually WebM despite having .wav extension
                if (fileName.toLowerCase().endsWith(".wav")) {
                    try {
                        byte[] header = new byte[4];
                        try (var inputStream = resource.getInputStream()) {
                            if (inputStream.read(header) == 4) {
                                // Check for WebM signature (1A 45 DF A3)
                                if (header[0] == 0x1A && header[1] == 0x45 && header[2] == (byte)0xDF && header[3] == (byte)0xA3) {
                                    contentType = "video/webm";
                                    logger.info("Detected WebM file with .wav extension: {}", fileName);
                                }
                            }
                        }
                    } catch (Exception e) {
                        logger.warn("Could not check file header for {}: {}", fileName, e.getMessage());
                    }
                }
                
                // Convert audio files to MP3 for download
                if (isAudioFile(fileName)) {
                    try {
                        Path originalPath = Paths.get("uploads/homework").resolve(fileName);
                        Path mp3Path = audioConversionService.getMp3File(originalPath);
                        
                        if (mp3Path != null && Files.exists(mp3Path)) {
                            // Use the converted MP3 file
                            finalResource = new UrlResource(mp3Path.toUri());
                            finalFileName = mp3Path.getFileName().toString();
                            contentType = "audio/mpeg";
                            logger.info("Serving converted MP3 file: {}", finalFileName);
                        } else {
                            logger.warn("Could not convert audio to MP3, serving original file");
                        }
                    } catch (Exception e) {
                        logger.error("Error converting audio to MP3: {}", e.getMessage(), e);
                    }
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + finalFileName + "\"")
                    .body(finalResource);
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
        } else if (fileName.endsWith(".webm")) {
            return "video/webm";
        } else if (fileName.endsWith(".wav")) {
            return "audio/wav";
        } else if (fileName.endsWith(".mp3")) {
            return "audio/mpeg";
        } else if (fileName.endsWith(".ogg")) {
            return "audio/ogg";
        } else if (fileName.endsWith(".m4a")) {
            return "audio/mp4";
        } else {
            return "application/octet-stream";
        }
    }
    
    /**
     * Checks if a file is an audio file based on its extension
     */
    private boolean isAudioFile(String fileName) {
        String lowerFileName = fileName.toLowerCase();
        return lowerFileName.endsWith(".wav") || 
               lowerFileName.endsWith(".mp3") || 
               lowerFileName.endsWith(".ogg") || 
               lowerFileName.endsWith(".m4a") ||
               lowerFileName.endsWith(".webm");
    }
} 