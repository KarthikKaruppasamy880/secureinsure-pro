package com.secureinsure.gateway.controller;

import com.secureinsure.gateway.logging.LoggingService;
import com.secureinsure.gateway.logging.ServerRuntimeLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/logs")
@CrossOrigin(origins = "*")
public class LoggingController {
    
    @Autowired
    private LoggingService loggingService;
    
    @Autowired
    private ServerRuntimeLogger serverRuntimeLogger;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> receiveLogs(@RequestBody Map<String, Object> request, 
                                                          HttpServletRequest httpRequest) {
        try {
            // Extract logs from request
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> logs = (List<Map<String, Object>>) request.get("logs");
            
            if (logs != null && !logs.isEmpty()) {
                // Process each log entry
                for (Map<String, Object> logEntry : logs) {
                    String level = (String) logEntry.get("level");
                    String category = (String) logEntry.get("category");
                    String message = (String) logEntry.get("message");
                    @SuppressWarnings("unchecked")
                    Map<String, Object> details = (Map<String, Object>) logEntry.get("details");
                    String userId = (String) logEntry.get("userId");
                    String sessionId = (String) logEntry.get("sessionId");
                    String ipAddress = getClientIpAddress(httpRequest);
                    String userAgent = httpRequest.getHeader("User-Agent");
                    
                    // Log to backend service
                    switch (level.toUpperCase()) {
                        case "DEBUG":
                            loggingService.debug(category, message, details, userId, sessionId, null, ipAddress, userAgent);
                            break;
                        case "INFO":
                            loggingService.info(category, message, details, userId, sessionId, null, ipAddress, userAgent);
                            break;
                        case "WARN":
                            loggingService.warn(category, message, details, userId, sessionId, null, ipAddress, userAgent);
                            break;
                        case "ERROR":
                            loggingService.error(category, message, details, userId, sessionId, null, ipAddress, userAgent);
                            break;
                        case "CRITICAL":
                            loggingService.critical(category, message, details, userId, sessionId, null, ipAddress, userAgent);
                            break;
                        default:
                            loggingService.info(category, message, details, userId, sessionId, null, ipAddress, userAgent);
                    }
                }
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Logs received and processed successfully");
                response.put("count", logs.size());
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "No logs provided in request");
                
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            loggingService.error("LoggingController", "Error processing received logs");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing logs: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        try {
            Map<String, Object> healthReport = serverRuntimeLogger.getSystemHealthReport();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("timestamp", System.currentTimeMillis());
            response.put("health", healthReport);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            loggingService.error("LoggingController", "Error getting system health");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error getting system health: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getLoggingStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("logCount", loggingService.getLogCount());
            status.put("queueSize", loggingService.getQueueSize());
            status.put("currentLogFile", loggingService.getCurrentLogFile());
            status.put("logFiles", loggingService.getLogFiles());
            status.put("systemHealthy", serverRuntimeLogger.isSystemHealthy());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", status);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            loggingService.error("LoggingController", "Error getting logging status");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error getting logging status: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testLogging(@RequestBody Map<String, Object> request,
                                                          HttpServletRequest httpRequest) {
        try {
            String level = (String) request.getOrDefault("level", "INFO");
            String category = (String) request.getOrDefault("category", "Test");
            String message = (String) request.getOrDefault("message", "Test log entry");
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) request.get("details");
            
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            // Log test entry
            switch (level.toUpperCase()) {
                case "DEBUG":
                    loggingService.debug(category, message, details, null, null, null, ipAddress, userAgent);
                    break;
                case "INFO":
                    loggingService.info(category, message, details, null, null, null, ipAddress, userAgent);
                    break;
                case "WARN":
                    loggingService.warn(category, message, details, null, null, null, ipAddress, userAgent);
                    break;
                case "ERROR":
                    loggingService.error(category, message, details, null, null, null, ipAddress, userAgent);
                    break;
                case "CRITICAL":
                    loggingService.critical(category, message, details, null, null, null, ipAddress, userAgent);
                    break;
                default:
                    loggingService.info(category, message, details, null, null, null, ipAddress, userAgent);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test log entry created successfully");
            response.put("level", level);
            response.put("category", category);
            response.put("message", message);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            loggingService.error("LoggingController", "Error creating test log entry");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating test log entry: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PostMapping("/error")
    public ResponseEntity<Map<String, Object>> logError(@RequestBody Map<String, Object> request,
                                                       HttpServletRequest httpRequest) {
        try {
            String category = (String) request.get("category");
            String message = (String) request.get("message");
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) request.get("details");
            String userId = (String) request.get("userId");
            String sessionId = (String) request.get("sessionId");
            
            if (category == null || message == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Category and message are required");
                
                return ResponseEntity.badRequest().body(response);
            }
            
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            // Log error
            loggingService.error(category, message, details, userId, sessionId, null, ipAddress, userAgent);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Error logged successfully");
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            loggingService.error("LoggingController", "Error logging error entry");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error logging error entry: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        try {
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("logCount", loggingService.getLogCount());
            metrics.put("queueSize", loggingService.getQueueSize());
            metrics.put("systemHealth", serverRuntimeLogger.getSystemHealthReport());
            metrics.put("timestamp", System.currentTimeMillis());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("metrics", metrics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            loggingService.error("LoggingController", "Error getting metrics");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error getting metrics: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
