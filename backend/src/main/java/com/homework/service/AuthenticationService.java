package com.homework.service;

import com.homework.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthenticationService {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public Map<String, Object> validateTokenAndGetUserInfo(String authHeader) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                result.put("valid", false);
                result.put("error", "Invalid authorization header");
                return result;
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            if (!jwtTokenProvider.validateToken(token)) {
                result.put("valid", false);
                result.put("error", "Invalid or expired token");
                return result;
            }

            String email = jwtTokenProvider.getEmailFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);

            if (email == null || role == null || userId == null) {
                result.put("valid", false);
                result.put("error", "Invalid token claims");
                return result;
            }

            result.put("valid", true);
            result.put("email", email);
            result.put("role", role);
            result.put("userId", userId);
            
        } catch (Exception e) {
            result.put("valid", false);
            result.put("error", "Token validation failed: " + e.getMessage());
        }
        
        return result;
    }

    public boolean hasRole(String authHeader, String requiredRole) {
        Map<String, Object> userInfo = validateTokenAndGetUserInfo(authHeader);
        if (!(Boolean) userInfo.get("valid")) {
            return false;
        }
        return requiredRole.equals(userInfo.get("role"));
    }

    public boolean hasAnyRole(String authHeader, String... requiredRoles) {
        Map<String, Object> userInfo = validateTokenAndGetUserInfo(authHeader);
        if (!(Boolean) userInfo.get("valid")) {
            return false;
        }
        String userRole = (String) userInfo.get("role");
        for (String role : requiredRoles) {
            if (role.equals(userRole)) {
                return true;
            }
        }
        return false;
    }
}
