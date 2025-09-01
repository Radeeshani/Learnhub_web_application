package com.homework;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;

import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import java.time.LocalDateTime;

public class EmailSystemTest {
    
    public static void main(String[] args) {
        System.out.println("🧪🧪🧪 STANDALONE EMAIL SYSTEM TEST STARTING 🧪🧪🧪");
        
        try {
            // Test 1: Create JavaMailSender
            System.out.println("🔍 Test 1: Creating JavaMailSender...");
            JavaMailSender mailSender = createMailSender();
            System.out.println("✅ JavaMailSender created successfully");
            
            // Test 2: Send simple text email
            System.out.println("🔍 Test 2: Sending simple text email...");
            sendSimpleEmail(mailSender);
            System.out.println("✅ Simple email sent successfully");
            
            // Test 3: Send HTML email (like our homework emails)
            System.out.println("🔍 Test 3: Sending HTML email...");
            sendHtmlEmail(mailSender);
            System.out.println("✅ HTML email sent successfully");
            
            System.out.println("🎉🎉🎉 ALL EMAIL TESTS PASSED! 🎉🎉🎉");
            
        } catch (Exception e) {
            System.out.println("❌❌❌ EMAIL TEST FAILED ❌❌❌");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static JavaMailSender createMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername("ashfak25321@gmail.com");
        mailSender.setPassword("aahy bavj ftvf dtqh");
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");
        
        return mailSender;
    }
    
    private static void sendSimpleEmail(JavaMailSender mailSender) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("ashfak25321@gmail.com");
        message.setTo("ashfak25321@gmail.com");
        message.setSubject("🧪 EMAIL SYSTEM TEST - Simple Email");
        message.setText("This is a test email to verify the email system is working.\n\nIf you receive this, the basic email functionality is working!");
        
        mailSender.send(message);
        System.out.println("   📧 Simple email sent to: ashfak25321@gmail.com");
    }
    
    private static void sendHtmlEmail(JavaMailSender mailSender) {
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>🧪 Email System Test</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; border: 1px solid #ddd; margin: 20px 0; }
                    .footer { text-align: center; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🧪 Email System Test</h1>
                    <p>Testing HTML Email Functionality</p>
                </div>
                
                <div class="content">
                    <h2>✅ Email System is Working!</h2>
                    <p>If you can see this formatted email, then:</p>
                    <ul>
                        <li>✅ SMTP connection is working</li>
                        <li>✅ Authentication is working</li>
                        <li>✅ HTML emails are working</li>
                        <li>✅ The email system is ready for homework notifications</li>
                    </ul>
                    
                    <p><strong>Next step:</strong> Test the full homework creation flow!</p>
                </div>
                
                <div class="footer">
                    <p>This is a test email from the Homework Application Email System</p>
                    <p>Sent at: " + LocalDateTime.now() + "</p>
                </div>
            </body>
            </html>
            """;
        
        MimeMessagePreparator messagePreparator = mimeMessage -> {
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage);
            messageHelper.setFrom("ashfak25321@gmail.com");
            messageHelper.setTo("ashfak25321@gmail.com");
            messageHelper.setSubject("🧪 EMAIL SYSTEM TEST - HTML Email");
            messageHelper.setText(htmlContent, true);
        };
        
        mailSender.send(messagePreparator);
        System.out.println("   📧 HTML email sent to: ashfak25321@gmail.com");
    }
}
