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
            Map<String, Object> user = new HashMap<>();
            user.put("id", 1L);
            user.put("username", username);
            user.put("email", "admin@secureinsure.com");
            user.put("role", "ADMIN");
            user.put("firstName", "Admin");
            user.put("lastName", "User");
            user.put("fullName", "Admin User");
            user.put("permissions", new String[]{"read", "write", "delete", "admin"});
            response.put("user", user);
            response.put("message", "Login successful");
        } else if ("user".equals(username) && "user123".equals(password)) {
            response.put("success", true);
            response.put("token", "demo-token-" + System.currentTimeMillis());
            Map<String, Object> user2 = new HashMap<>();
            user2.put("id", 2L);
            user2.put("username", username);
            user2.put("email", "user@secureinsure.com");
            user2.put("role", "USER");
            user2.put("firstName", "Regular");
            user2.put("lastName", "User");
            user2.put("fullName", "Regular User");
            user2.put("permissions", new String[]{"read", "write"});
            response.put("user", user2);
            response.put("message", "Login successful");
        } else if ("agent".equals(username) && "agent123".equals(password)) {
            response.put("success", true);
            response.put("token", "demo-token-" + System.currentTimeMillis());
            Map<String, Object> user3 = new HashMap<>();
            user3.put("id", 3L);
            user3.put("username", username);
            user3.put("email", "agent@secureinsure.com");
            user3.put("role", "AGENT");
            user3.put("firstName", "Insurance");
            user3.put("lastName", "Agent");
            user3.put("fullName", "Insurance Agent");
            user3.put("permissions", new String[]{"read", "write", "claims"});
            response.put("user", user3);
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

    // Stub endpoints for optional services to prevent frontend errors
    @GetMapping("/face-api/face/status")
    public ResponseEntity<Map<String, Object>> faceApiStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "unavailable");
        response.put("message", "Face detection service not implemented");
        response.put("available", false);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/voice-api/voice/status")
    public ResponseEntity<Map<String, Object>> voiceApiStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "unavailable");
        response.put("message", "Voice service not implemented");
        response.put("available", false);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/fingerprint-api/fingerprint/status")
    public ResponseEntity<Map<String, Object>> fingerprintApiStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "unavailable");
        response.put("message", "Fingerprint service not implemented");
        response.put("available", false);
        return ResponseEntity.ok(response);
    }
    
    // Health endpoints
    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ready");
        response.put("service", "auth-service");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/version")
    public ResponseEntity<Map<String, Object>> version() {
        Map<String, Object> response = new HashMap<>();
        response.put("version", "2.0.0");
        response.put("service", "auth-service");
        response.put("build", "2024-09-02");
        return ResponseEntity.ok(response);
    }
    
    // Search endpoint
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam String q) {
        Map<String, Object> response = new HashMap<>();
        response.put("query", q);
        response.put("results", new Object[]{
            Map.of("id", "CASE-001", "type", "case", "title", "Sample Case", "status", "active"),
            Map.of("id", "POL-001", "type", "policy", "title", "Sample Policy", "status", "active")
        });
        response.put("total", 2);
        return ResponseEntity.ok(response);
    }
    
    // Chatbot session endpoint
    @PostMapping("/chatbot/session/start")
    public ResponseEntity<Map<String, Object>> startChatbotSession() {
        Map<String, Object> response = new HashMap<>();
        response.put("id", "session-" + System.currentTimeMillis());
        response.put("status", "active");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    // Chatbot message endpoint
    @PostMapping("/chatbot/message")
    public ResponseEntity<Map<String, Object>> chatbotMessage(@RequestBody Map<String, Object> request) {
        String id = (String) request.get("id");
        String text = (String) request.get("text");
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        
        // Simple pattern matching for case navigation
        if (text != null && text.toLowerCase().contains("case")) {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("case\\s+([A-Za-z0-9\\-]+)", java.util.regex.Pattern.CASE_INSENSITIVE);
            java.util.regex.Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                String caseId = matcher.group(1);
                response.put("action", "NAVIGATE");
                response.put("target", "/cases/" + caseId);
                response.put("found", true);
            } else {
                response.put("action", "NONE");
                response.put("found", false);
            }
        } else {
            response.put("action", "NONE");
            response.put("found", false);
        }
        
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    // TX1 Import endpoint
    @PostMapping("/tx1/import")
    public ResponseEntity<Map<String, Object>> importTx1(@RequestBody String xmlData) {
        Map<String, Object> response = new HashMap<>();
        String caseId = "CASE-" + System.currentTimeMillis();
        response.put("caseId", caseId);
        response.put("status", "imported");
        response.put("message", "TX1 data imported successfully");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    // ExamOne Lab Request
    @PostMapping("/examone/lab-request")
    public ResponseEntity<Map<String, Object>> examOneLabRequest(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("requestId", "LAB-" + System.currentTimeMillis());
        response.put("status", "submitted");
        response.put("message", "Lab request submitted successfully");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    // ExamOne Results
    @GetMapping("/examone/results")
    public ResponseEntity<Map<String, Object>> examOneResults(@RequestParam String caseId) {
        Map<String, Object> response = new HashMap<>();
        response.put("caseId", caseId);
        response.put("results", new Object[]{
            Map.of("test", "Blood Pressure", "value", "120/80", "status", "normal", "date", "2024-09-02"),
            Map.of("test", "Cholesterol", "value", "180", "status", "normal", "date", "2024-09-02"),
            Map.of("test", "Glucose", "value", "95", "status", "normal", "date", "2024-09-02")
        });
        response.put("total", 3);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    // Case creation with Dev Template Bypass
    @PostMapping("/cases")
    public ResponseEntity<Map<String, Object>> createCase(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        String caseId = "CASE-" + System.currentTimeMillis();
        response.put("caseId", caseId);
        response.put("status", "created");
        response.put("message", "Case created successfully");
        response.put("template", "Default Term Life v0 (Dev Fallback)");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    // Section-level PATCH for case updates
    @PatchMapping("/cases/{caseId}/application/{section}")
    public ResponseEntity<Map<String, Object>> updateCaseSection(
            @PathVariable String caseId, 
            @PathVariable String section, 
            @RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        response.put("caseId", caseId);
        response.put("section", section);
        response.put("status", "updated");
        response.put("message", "Section updated successfully");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    // WebSocket stub endpoint (returns connection info)
    @GetMapping("/ws")
    public ResponseEntity<Map<String, Object>> websocketInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "websocket_not_implemented");
        response.put("message", "WebSocket endpoint not implemented - using HTTP fallback");
        response.put("fallback", true);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    // Templates endpoint with Dev Template Bypass
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getTemplates() {
        Map<String, Object> response = new HashMap<>();
        
        // Dev Template Bypass - always return a default template
        Object[] templates = {
            Map.of(
                "id", "tmpl-dev-term-v0",
                "name", "Default Term Life v0",
                "description", "Default template for development",
                "createdAt", System.currentTimeMillis(),
                "isDefault", true
            )
        };
        
        response.put("items", templates);
        response.put("total", templates.length);
        response.put("devBypass", true);
        return ResponseEntity.ok(response);
    }
    
    // Get cases for dashboard
    @GetMapping("/cases")
    public ResponseEntity<Map<String, Object>> getCases(@RequestParam(required = false) String q) {
        Map<String, Object> response = new HashMap<>();
        
        // Mock cases data
        Object[] cases = {
            Map.of(
                "caseId", "CASE-001",
                "policyNumber", "POL-001",
                "insuredName", "John Doe",
                "status", "Active",
                "createdAt", System.currentTimeMillis() - 86400000
            ),
            Map.of(
                "caseId", "CASE-002", 
                "policyNumber", "POL-002",
                "insuredName", "Jane Smith",
                "status", "Draft",
                "createdAt", System.currentTimeMillis() - 172800000
            )
        };
        
        // Filter by query if provided
        if (q != null && !q.trim().isEmpty()) {
            String query = q.toLowerCase();
            cases = java.util.Arrays.stream(cases)
                .filter(caseObj -> {
                    Map<String, Object> caseMap = (Map<String, Object>) caseObj;
                    return caseMap.toString().toLowerCase().contains(query);
                })
                .toArray();
        }
        
        response.put("items", cases);
        response.put("total", cases.length);
        return ResponseEntity.ok(response);
    }
    
    // Get case application details
    @GetMapping("/cases/{caseId}/application")
    public ResponseEntity<Map<String, Object>> getCaseApplication(@PathVariable String caseId) {
        Map<String, Object> response = new HashMap<>();
        response.put("caseId", caseId);
        response.put("sections", Map.of(
            "insured", Map.of(
                "fields", Map.of(
                    "firstName", "John",
                    "lastName", "Doe",
                    "dateOfBirth", "1990-01-01",
                    "ssn", "123-45-6789"
                )
            ),
            "policy", Map.of(
                "fields", Map.of(
                    "policyType", "Term Life",
                    "faceAmount", "500000",
                    "premium", "500.00"
                )
            )
        ));
        return ResponseEntity.ok(response);
    }
    
    // Create case application
    @PostMapping("/cases/{caseId}/application")
    public ResponseEntity<Map<String, Object>> createCaseApplication(
            @PathVariable String caseId, 
            @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("caseId", caseId);
        response.put("created", true);
        response.put("message", "Application created successfully");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
} 