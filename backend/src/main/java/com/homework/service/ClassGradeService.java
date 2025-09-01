package com.homework.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class ClassGradeService {
    
    /**
     * Convert class grade to alternative formats for flexible matching
     * Handles conversion between "Grade X" and "Xth Grade" formats
     */
    public List<String> getAlternativeClassGradeFormats(String classGrade) {
        List<String> formats = new ArrayList<>();
        formats.add(classGrade); // Add original format
        
        if (classGrade == null || classGrade.trim().isEmpty()) {
            return formats;
        }
        
        String trimmedGrade = classGrade.trim();
        
        // Pattern to match "Grade X" format
        Pattern gradePattern = Pattern.compile("^Grade\\s*(\\d+)$", Pattern.CASE_INSENSITIVE);
        Matcher gradeMatcher = gradePattern.matcher(trimmedGrade);
        
        if (gradeMatcher.find()) {
            String number = gradeMatcher.group(1);
            formats.add(getOrdinalGrade(number));
        }
        
        // Pattern to match "Xth Grade" format
        Pattern ordinalPattern = Pattern.compile("^(\\d+)(?:st|nd|rd|th)\\s*Grade$", Pattern.CASE_INSENSITIVE);
        Matcher ordinalMatcher = ordinalPattern.matcher(trimmedGrade);
        
        if (ordinalMatcher.find()) {
            String number = ordinalMatcher.group(1);
            formats.add("Grade " + number);
        }
        
        return formats;
    }
    
    /**
     * Convert number to ordinal format (1st, 2nd, 3rd, 4th, etc.)
     */
    private String getOrdinalGrade(String number) {
        int num = Integer.parseInt(number);
        if (num >= 11 && num <= 13) {
            return num + "th Grade";
        }
        
        switch (num % 10) {
            case 1: return num + "st Grade";
            case 2: return num + "nd Grade";
            case 3: return num + "rd Grade";
            default: return num + "th Grade";
        }
    }
    
    /**
     * Check if two class grades are equivalent
     */
    public boolean areClassGradesEquivalent(String grade1, String grade2) {
        if (grade1 == null || grade2 == null) {
            return false;
        }
        
        List<String> formats1 = getAlternativeClassGradeFormats(grade1);
        List<String> formats2 = getAlternativeClassGradeFormats(grade2);
        
        // Check if any format from grade1 matches any format from grade2
        for (String format1 : formats1) {
            for (String format2 : formats2) {
                if (format1.equalsIgnoreCase(format2)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
