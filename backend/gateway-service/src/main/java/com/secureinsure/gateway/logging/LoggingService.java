package com.secureinsure.gateway.logging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class LoggingService {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingService.class);
    
    @Value("${logging.file.path:logs}")
    private String logFilePath;
    
    @Value("${logging.file.max-size:100MB}")
    private String maxLogFileSize;
    
    @Value("${logging.retention.days:30}")
    private int retentionDays;
    
    @Value("${logging.level:INFO}")
    private String logLevel;
    
    private final BlockingQueue<LogEntry> logQueue = new LinkedBlockingQueue<>();
    private final ExecutorService logWriterExecutor = Executors.newSingleThreadExecutor();
    private final ScheduledExecutorService maintenanceExecutor = Executors.newScheduledThreadPool(1);
    private final AtomicLong logCounter = new AtomicLong(0);
    
    private volatile boolean shutdown = false;
    private Path currentLogFile;
    private PrintWriter logWriter;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public enum LogLevel {
        DEBUG, INFO, WARN, ERROR, CRITICAL
    }
    
    public static class LogEntry {
        private final String timestamp;
        private final LogLevel level;
        private final String category;
        private final String message;
        private final Map<String, Object> details;
        private final String userId;
        private final String sessionId;
        private final String requestId;
        private final String ipAddress;
        private final String userAgent;
        private final String stackTrace;
        
        public LogEntry(LogLevel level, String category, String message, Map<String, Object> details,
                       String userId, String sessionId, String requestId, String ipAddress, 
                       String userAgent, String stackTrace) {
            this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            this.level = level;
            this.category = category;
            this.message = message;
            this.details = details != null ? new HashMap<>(details) : new HashMap<>();
            this.userId = userId;
            this.sessionId = sessionId;
            this.requestId = requestId;
            this.ipAddress = ipAddress;
            this.userAgent = userAgent;
            this.stackTrace = stackTrace;
        }
        
        // Getters
        public String getTimestamp() { return timestamp; }
        public LogLevel getLevel() { return level; }
        public String getCategory() { return category; }
        public String getMessage() { return message; }
        public Map<String, Object> getDetails() { return new HashMap<>(details); }
        public String getUserId() { return userId; }
        public String getSessionId() { return sessionId; }
        public String getRequestId() { return requestId; }
        public String getIpAddress() { return ipAddress; }
        public String getUserAgent() { return userAgent; }
        public String getStackTrace() { return stackTrace; }
    }
    
    @PostConstruct
    public void initialize() {
        try {
            // Create log directory if it doesn't exist
            Path logDir = Paths.get(logFilePath);
            if (!Files.exists(logDir)) {
                Files.createDirectories(logDir);
            }
            
            // Create initial log file
            createNewLogFile();
            
            // Start log writer thread
            startLogWriter();
            
            // Start maintenance tasks
            startMaintenanceTasks();
            
            logger.info("LoggingService initialized successfully. Log level: {}, Max file size: {}, Retention: {} days", 
                       logLevel, maxLogFileSize, retentionDays);
            
        } catch (Exception e) {
            logger.error("Failed to initialize LoggingService", e);
        }
    }
    
    @PreDestroy
    public void shutdown() {
        shutdown = true;
        
        try {
            // Shutdown executors
            logWriterExecutor.shutdown();
            maintenanceExecutor.shutdown();
            
            // Wait for completion
            if (!logWriterExecutor.awaitTermination(10, TimeUnit.SECONDS)) {
                logWriterExecutor.shutdownNow();
            }
            if (!maintenanceExecutor.awaitTermination(10, TimeUnit.SECONDS)) {
                maintenanceExecutor.shutdownNow();
            }
            
            // Close log writer
            if (logWriter != null) {
                logWriter.close();
            }
            
            logger.info("LoggingService shutdown completed");
            
        } catch (Exception e) {
            logger.error("Error during LoggingService shutdown", e);
        }
    }
    
    private void createNewLogFile() throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String filename = String.format("secureinsure-backend-%s.log", timestamp);
        currentLogFile = Paths.get(logFilePath, filename);
        
        if (logWriter != null) {
            logWriter.close();
        }
        
        logWriter = new PrintWriter(new BufferedWriter(new FileWriter(currentLogFile.toFile(), true)));
        logger.info("Created new log file: {}", currentLogFile);
    }
    
    private void startLogWriter() {
        logWriterExecutor.submit(() -> {
            while (!shutdown) {
                try {
                    LogEntry entry = logQueue.poll(1, TimeUnit.SECONDS);
                    if (entry != null) {
                        writeLogEntry(entry);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    logger.error("Error in log writer thread", e);
                }
            }
        });
    }
    
    private void startMaintenanceTasks() {
        // Rotate logs every hour
        maintenanceExecutor.scheduleAtFixedRate(this::rotateLogsIfNeeded, 1, 1, TimeUnit.HOURS);
        
        // Clean old logs daily
        maintenanceExecutor.scheduleAtFixedRate(this::cleanOldLogs, 1, 1, TimeUnit.DAYS);
        
        // Health check every 5 minutes
        maintenanceExecutor.scheduleAtFixedRate(this::healthCheck, 5, 5, TimeUnit.MINUTES);
    }
    
    private void writeLogEntry(LogEntry entry) {
        try {
            // Check if we need to rotate logs
            if (shouldRotateLogs()) {
                createNewLogFile();
            }
            
            // Format log entry
            String logLine = formatLogEntry(entry);
            
            // Write to file
            if (logWriter != null) {
                logWriter.println(logLine);
                logWriter.flush();
            }
            
            // Also log to SLF4J for console output
            logToSLF4J(entry);
            
        } catch (Exception e) {
            logger.error("Failed to write log entry", e);
        }
    }
    
    private String formatLogEntry(LogEntry entry) {
        try {
            Map<String, Object> logData = new HashMap<>();
            logData.put("timestamp", entry.getTimestamp());
            logData.put("level", entry.getLevel().name());
            logData.put("category", entry.getCategory());
            logData.put("message", entry.getMessage());
            logData.put("details", entry.getDetails());
            logData.put("userId", entry.getUserId());
            logData.put("sessionId", entry.getSessionId());
            logData.put("requestId", entry.getRequestId());
            logData.put("ipAddress", entry.getIpAddress());
            logData.put("userAgent", entry.getUserAgent());
            if (entry.getStackTrace() != null) {
                logData.put("stackTrace", entry.getStackTrace());
            }
            
            return objectMapper.writeValueAsString(logData);
            
        } catch (Exception e) {
            return String.format("{\"error\":\"Failed to format log entry: %s\"}", e.getMessage());
        }
    }
    
    private void logToSLF4J(LogEntry entry) {
        String logMessage = String.format("[%s] %s: %s", entry.getCategory(), entry.getMessage(), 
                                        entry.getDetails().isEmpty() ? "" : entry.getDetails());
        
        switch (entry.getLevel()) {
            case DEBUG:
                logger.debug(logMessage);
                break;
            case INFO:
                logger.info(logMessage);
                break;
            case WARN:
                logger.warn(logMessage);
                break;
            case ERROR:
                logger.error(logMessage);
                break;
            case CRITICAL:
                logger.error("CRITICAL: " + logMessage);
                break;
        }
    }
    
    private boolean shouldRotateLogs() {
        try {
            if (currentLogFile == null || !Files.exists(currentLogFile)) {
                return true;
            }
            
            long fileSize = Files.size(currentLogFile);
            long maxSize = parseSize(maxLogFileSize);
            
            return fileSize > maxSize;
            
        } catch (Exception e) {
            logger.error("Error checking log file size", e);
            return false;
        }
    }
    
    private long parseSize(String sizeStr) {
        sizeStr = sizeStr.toUpperCase();
        if (sizeStr.endsWith("KB")) {
            return Long.parseLong(sizeStr.substring(0, sizeStr.length() - 2)) * 1024;
        } else if (sizeStr.endsWith("MB")) {
            return Long.parseLong(sizeStr.substring(0, sizeStr.length() - 2)) * 1024 * 1024;
        } else if (sizeStr.endsWith("GB")) {
            return Long.parseLong(sizeStr.substring(0, sizeStr.length() - 2)) * 1024 * 1024 * 1024;
        } else {
            return Long.parseLong(sizeStr);
        }
    }
    
    private void rotateLogsIfNeeded() {
        try {
            if (shouldRotateLogs()) {
                createNewLogFile();
                logger.info("Log files rotated");
            }
        } catch (Exception e) {
            logger.error("Error rotating log files", e);
        }
    }
    
    private void cleanOldLogs() {
        try {
            Path logDir = Paths.get(logFilePath);
            if (!Files.exists(logDir)) {
                return;
            }
            
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
            
            Files.list(logDir)
                .filter(path -> path.toString().endsWith(".log"))
                .filter(path -> {
                    try {
                        String filename = path.getFileName().toString();
                        // Extract date from filename: secureinsure-backend-2024-01-15_10-30-00.log
                        String dateStr = filename.substring(filename.indexOf("-") + 1, filename.lastIndexOf("."));
                        LocalDateTime fileDate = LocalDateTime.parse(dateStr, 
                            DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
                        return fileDate.isBefore(cutoffDate);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .forEach(path -> {
                    try {
                        Files.delete(path);
                        logger.info("Deleted old log file: {}", path);
                    } catch (IOException e) {
                        logger.error("Failed to delete old log file: {}", path, e);
                    }
                });
                
        } catch (Exception e) {
            logger.error("Error cleaning old logs", e);
        }
    }
    
    private void healthCheck() {
        try {
            // Check if log writer is working
            if (logWriter == null || logWriter.checkError()) {
                logger.error("Log writer health check failed - recreating");
                createNewLogFile();
            }
            
            // Check disk space
            Path logDir = Paths.get(logFilePath);
            if (Files.exists(logDir)) {
                long freeSpace = logDir.toFile().getFreeSpace();
                if (freeSpace < 100 * 1024 * 1024) { // Less than 100MB
                    logger.warn("Low disk space for logs: {} bytes free", freeSpace);
                }
            }
            
        } catch (Exception e) {
            logger.error("Health check failed", e);
        }
    }
    
    // Public logging methods
    public void debug(String category, String message) {
        log(LogLevel.DEBUG, category, message, new HashMap<>(), null, null, null, null, null, null);
    }
    
    public void info(String category, String message) {
        log(LogLevel.INFO, category, message, new HashMap<>(), null, null, null, null, null, null);
    }
    
    public void warn(String category, String message) {
        log(LogLevel.WARN, category, message, new HashMap<>(), null, null, null, null, null, null);
    }
    
    public void error(String category, String message) {
        log(LogLevel.ERROR, category, message, new HashMap<>(), null, null, null, null, null, null);
    }
    
    public void critical(String category, String message) {
        log(LogLevel.CRITICAL, category, message, new HashMap<>(), null, null, null, null, null, null);
    }
    
    public void debug(String category, String message, Map<String, Object> details, 
                     String userId, String sessionId, String requestId, String ipAddress, String userAgent) {
        log(LogLevel.DEBUG, category, message, details, userId, sessionId, requestId, ipAddress, userAgent, null);
    }
    
    public void info(String category, String message, Map<String, Object> details, 
                    String userId, String sessionId, String requestId, String ipAddress, String userAgent) {
        log(LogLevel.INFO, category, message, details, userId, sessionId, requestId, ipAddress, userAgent, null);
    }
    
    public void warn(String category, String message, Map<String, Object> details, 
                    String userId, String sessionId, String requestId, String ipAddress, String userAgent) {
        log(LogLevel.WARN, category, message, details, userId, sessionId, requestId, ipAddress, userAgent, null);
    }
    
    public void error(String category, String message, Map<String, Object> details, 
                     String userId, String sessionId, String requestId, String ipAddress, String userAgent) {
        log(LogLevel.ERROR, category, message, details, userId, sessionId, requestId, ipAddress, userAgent, null);
    }
    
    public void critical(String category, String message, Map<String, Object> details, 
                        String userId, String sessionId, String requestId, String ipAddress, String userAgent) {
        log(LogLevel.CRITICAL, category, message, details, userId, sessionId, requestId, ipAddress, userAgent, null);
    }
    
    public void logException(String category, String message, Exception exception, 
                           String userId, String sessionId, String requestId, String ipAddress, String userAgent) {
        Map<String, Object> details = new HashMap<>();
        details.put("exceptionType", exception.getClass().getSimpleName());
        details.put("exceptionMessage", exception.getMessage());
        
        String stackTrace = getStackTrace(exception);
        
        log(LogLevel.ERROR, category, message, details, userId, sessionId, requestId, ipAddress, userAgent, stackTrace);
    }
    
    private void log(LogLevel level, String category, String message, Map<String, Object> details,
                    String userId, String sessionId, String requestId, String ipAddress, String userAgent, String stackTrace) {
        
        // Check log level
        if (!shouldLog(level)) {
            return;
        }
        
        LogEntry entry = new LogEntry(level, category, message, details, userId, sessionId, requestId, ipAddress, userAgent, stackTrace);
        
        try {
            // Add to queue (non-blocking)
            if (!logQueue.offer(entry)) {
                logger.warn("Log queue is full, dropping log entry: {}", message);
            }
        } catch (Exception e) {
            logger.error("Failed to queue log entry", e);
        }
    }
    
    private boolean shouldLog(LogLevel level) {
        LogLevel configuredLevel = LogLevel.valueOf(logLevel.toUpperCase());
        return level.ordinal() >= configuredLevel.ordinal();
    }
    
    private String getStackTrace(Exception exception) {
        try (StringWriter sw = new StringWriter();
             PrintWriter pw = new PrintWriter(sw)) {
            exception.printStackTrace(pw);
            return sw.toString();
        } catch (Exception e) {
            return "Failed to get stack trace: " + e.getMessage();
        }
    }
    
    // Utility methods for monitoring
    public long getLogCount() {
        return logCounter.get();
    }
    
    public int getQueueSize() {
        return logQueue.size();
    }
    
    public String getCurrentLogFile() {
        return currentLogFile != null ? currentLogFile.toString() : "No log file";
    }
    
    public List<String> getLogFiles() {
        try {
            Path logDir = Paths.get(logFilePath);
            if (!Files.exists(logDir)) {
                return new ArrayList<>();
            }
            
            return Files.list(logDir)
                .filter(path -> path.toString().endsWith(".log"))
                .map(path -> path.getFileName().toString())
                .sorted()
                .collect(java.util.stream.Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error listing log files", e);
            return new ArrayList<>();
        }
    }
}
