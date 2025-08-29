package com.homework.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AudioConversionService {
    
    private static final Logger logger = LoggerFactory.getLogger(AudioConversionService.class);
    
    /**
     * Converts audio file to MP3 format
     * @param inputFilePath Path to the input audio file
     * @return Path to the converted MP3 file, or null if conversion fails
     */
    public Path convertToMp3(Path inputFilePath) {
        try {
            // Create output directory for converted files
            Path outputDir = Paths.get("uploads/homework/converted");
            Files.createDirectories(outputDir);
            
            // Generate unique filename for MP3
            String baseName = inputFilePath.getFileName().toString().replaceAll("\\.[^.]+$", "");
            String mp3FileName = UUID.randomUUID().toString() + "_" + baseName + ".mp3";
            Path outputPath = outputDir.resolve(mp3FileName);
            
            // Check if FFmpeg is available
            if (!isFFmpegAvailable()) {
                logger.warn("FFmpeg not available, cannot convert audio to MP3");
                return null;
            }
            
            // Convert audio to MP3 using FFmpeg
            boolean success = convertAudioToMp3(inputFilePath.toString(), outputPath.toString());
            
            if (success && Files.exists(outputPath)) {
                logger.info("Successfully converted {} to MP3: {}", inputFilePath.getFileName(), mp3FileName);
                return outputPath;
            } else {
                logger.error("Failed to convert {} to MP3", inputFilePath.getFileName());
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error converting audio to MP3: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Checks if FFmpeg is available on the system
     */
    private boolean isFFmpegAvailable() {
        try {
            ProcessBuilder pb = new ProcessBuilder("ffmpeg", "-version");
            Process process = pb.start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            logger.warn("FFmpeg not available: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Converts audio file to MP3 using FFmpeg command
     */
    private boolean convertAudioToMp3(String inputPath, String outputPath) {
        try {
            // FFmpeg command to convert to MP3 with good quality
            ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-i", inputPath,
                "-acodec", "libmp3lame",
                "-ab", "128k",
                "-ar", "44100",
                "-y", // Overwrite output file if exists
                outputPath
            );
            
            // Redirect error stream to output stream for logging
            pb.redirectErrorStream(true);
            
            Process process = pb.start();
            
            // Wait for conversion to complete
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                logger.info("FFmpeg conversion successful: {} -> {}", inputPath, outputPath);
                return true;
            } else {
                logger.error("FFmpeg conversion failed with exit code: {}", exitCode);
                return false;
            }
            
        } catch (Exception e) {
            logger.error("Error during FFmpeg conversion: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Gets the converted MP3 file path for a given audio file
     * If no converted file exists, attempts to convert
     */
    public Path getMp3File(Path originalAudioPath) {
        try {
            // Check if converted MP3 already exists
            Path convertedDir = Paths.get("uploads/homework/converted");
            if (!Files.exists(convertedDir)) {
                Files.createDirectories(convertedDir);
            }
            
            // Look for existing converted file
            String baseName = originalAudioPath.getFileName().toString().replaceAll("\\.[^.]+$", "");
            Files.list(convertedDir)
                .filter(path -> path.getFileName().toString().contains(baseName) && path.getFileName().toString().endsWith(".mp3"))
                .findFirst()
                .ifPresent(existingFile -> {
                    logger.info("Found existing MP3 conversion: {}", existingFile.getFileName());
                });
            
            // Convert if no existing MP3 found
            return convertToMp3(originalAudioPath);
            
        } catch (Exception e) {
            logger.error("Error getting MP3 file: {}", e.getMessage(), e);
            return null;
        }
    }
}
