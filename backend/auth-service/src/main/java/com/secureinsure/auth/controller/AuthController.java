package com.secureinsure.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        Map<String, Object> response = new HashMap<>();
        
        // Simple authentication for demo purposes
        if ("admin".equals(username) && "admin123".equals(password)) {
            response.put("success", true);
            response.put("token", "demo-token-" + System.currentTimeMillis());
            response.put("user", Map.of(
                "id", 1L,
                "username", username,
                "email", "admin@secureinsure.com",
                "role", "ADMIN",
                "firstName", "Admin",
                "lastName", "User",
                "fullName", "Admin User",
                "permissions", new String[]{"read", "write", "delete", "admin"}
            ));
            response.put("message", "Login successful");
        } else if ("user".equals(username) && "user123".equals(password)) {
            response.put("success", true);
            response.put("token", "demo-token-" + System.currentTimeMillis());
            response.put("user", Map.of(
                "id", 2L,
                "username", username,
                "email", "user@secureinsure.com",
                "role", "USER",
                "firstName", "Regular",
                "lastName", "User",
                "fullName", "Regular User",
                "permissions", new String[]{"read", "write"}
            ));
            response.put("message", "Login successful");
        } else if ("agent".equals(username) && "agent123".equals(password)) {
            response.put("success", true);
            response.put("token", "demo-token-" + System.currentTimeMillis());
            response.put("user", Map.of(
                "id", 3L,
                "username", username,
                "email", "agent@secureinsure.com",
                "role", "AGENT",
                "firstName", "Insurance",
                "lastName", "Agent",
                "fullName", "Insurance Agent",
                "permissions", new String[]{"read", "write", "claims"}
            ));
            response.put("message", "Login successful");
        } else {
            response.put("success", false);
            response.put("message", "Invalid username or password");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration successful");
        response.put("user", Map.of(
            "id", 4L,
            "username", request.get("username"),
            "email", request.get("email"),
            "role", "USER"
        ));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken() {
        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        response.put("user", Map.of(
            "id", 1L,
            "username", "admin",
            "email", "admin@secureinsure.com",
            "role", "ADMIN"
        ));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "auth-service");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
} 