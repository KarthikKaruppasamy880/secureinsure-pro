package com.secureinsure.admin.logging;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.lang.management.ClassLoadingMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ServerRuntimeLogger {
    
    private final RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
    private final MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
    private final ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
    private final OperatingSystemMXBean operatingSystemMXBean = ManagementFactory.getOperatingSystemMXBean();
    private final ClassLoadingMXBean classLoadingMXBean = ManagementFactory.getClassLoadingMXBean();
    
    private final Map<String, AtomicLong> errorCounters = new ConcurrentHashMap<>();
    private final Map<String, Long> lastErrorTime = new ConcurrentHashMap<>();
    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong totalErrors = new AtomicLong(0);
    private final AtomicLong totalWarnings = new AtomicLong(0);
    
    private long lastMemoryCheck = 0;
    private long lastThreadCheck = 0;
    private long lastClassCheck = 0;
    
    @PostConstruct
    public void initialize() {
        System.out.println("Admin Service Runtime Logger initialized");
        
        // Log initial system information
        logSystemInfo();
        
        // Set up error threshold monitoring
        setupErrorThresholdMonitoring();
    }
    
    private void logSystemInfo() {
        try {
            Map<String, Object> systemInfo = new HashMap<>();
            systemInfo.put("javaVersion", System.getProperty("java.version"));
            systemInfo.put("javaVendor", System.getProperty("java.vendor"));
            systemInfo.put("jvmVersion", runtimeMXBean.getVmVersion());
            systemInfo.put("startTime", runtimeMXBean.getStartTime());
            systemInfo.put("uptime", runtimeMXBean.getUptime());
            systemInfo.put("availableProcessors", operatingSystemMXBean.getAvailableProcessors());
            systemInfo.put("osName", operatingSystemMXBean.getName());
            systemInfo.put("osVersion", operatingSystemMXBean.getVersion());
            systemInfo.put("osArch", operatingSystemMXBean.getArch());
            
            System.out.println("Admin Service System Info: " + systemInfo);
            
        } catch (Exception e) {
            System.err.println("Failed to log system information: " + e.getMessage());
        }
    }
    
    private void setupErrorThresholdMonitoring() {
        // Monitor for error thresholds
        errorCounters.put("critical", new AtomicLong(0));
        errorCounters.put("error", new AtomicLong(0));
        errorCounters.put("warning", new AtomicLong(0));
    }
    
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void monitorSystemHealth() {
        try {
            // Memory monitoring
            monitorMemory();
            
            // Thread monitoring
            monitorThreads();
            
            // Class loading monitoring
            monitorClassLoading();
            
            // Performance monitoring
            monitorPerformance();
            
            // Error rate monitoring
            monitorErrorRates();
            
        } catch (Exception e) {
            System.err.println("Error during health monitoring: " + e.getMessage());
        }
    }
    
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void logDetailedMetrics() {
        try {
            logDetailedSystemMetrics();
        } catch (Exception e) {
            System.err.println("Error logging detailed metrics: " + e.getMessage());
        }
    }
    
    private void monitorMemory() {
        try {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastMemoryCheck < 30000) { // Only check every 30 seconds
                return;
            }
            lastMemoryCheck = currentTime;
            
            MemoryUsage heapMemoryUsage = memoryMXBean.getHeapMemoryUsage();
            MemoryUsage nonHeapMemoryUsage = memoryMXBean.getNonHeapMemoryUsage();
            
            long heapUsed = heapMemoryUsage.getUsed();
            long heapMax = heapMemoryUsage.getMax();
            long heapUsagePercent = (heapUsed * 100) / heapMax;
            
            // Check for memory issues
            if (heapUsagePercent > 90) {
                System.err.println("CRITICAL: Admin Service memory usage detected: " + heapUsagePercent + "%");
            } else if (heapUsagePercent > 80) {
                System.out.println("WARNING: Admin Service high memory usage detected: " + heapUsagePercent + "%");
            }
            
            // Log memory metrics
            Map<String, Object> memoryMetrics = new HashMap<>();
            memoryMetrics.put("heapUsed", heapUsed);
            memoryMetrics.put("heapMax", heapMax);
            memoryMetrics.put("heapUsagePercent", heapUsagePercent);
            memoryMetrics.put("nonHeapUsed", nonHeapMemoryUsage.getUsed());
            memoryMetrics.put("nonHeapMax", nonHeapMemoryUsage.getMax());
            
            System.out.println("Admin Service Memory metrics: " + memoryMetrics);
            
        } catch (Exception e) {
            System.err.println("Error monitoring memory: " + e.getMessage());
        }
    }
    
    private void monitorThreads() {
        try {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastThreadCheck < 30000) { // Only check every 30 seconds
                return;
            }
            lastThreadCheck = currentTime;
            
            int threadCount = threadMXBean.getThreadCount();
            int peakThreadCount = threadMXBean.getPeakThreadCount();
            int daemonThreadCount = threadMXBean.getDaemonThreadCount();
            long totalStartedThreadCount = threadMXBean.getTotalStartedThreadCount();
            
            // Check for thread issues
            if (threadCount > 1000) {
                System.out.println("WARNING: Admin Service high thread count detected: " + threadCount);
            }
            
            // Check for deadlocked threads
            long[] deadlockedThreads = threadMXBean.findDeadlockedThreads();
            if (deadlockedThreads != null && deadlockedThreads.length > 0) {
                System.err.println("CRITICAL: Admin Service deadlocked threads detected: " + deadlockedThreads.length);
            }
            
            // Log thread metrics
            Map<String, Object> threadMetrics = new HashMap<>();
            threadMetrics.put("threadCount", threadCount);
            threadMetrics.put("peakThreadCount", peakThreadCount);
            threadMetrics.put("daemonThreadCount", daemonThreadCount);
            threadMetrics.put("totalStartedThreadCount", totalStartedThreadCount);
            
            System.out.println("Admin Service Thread metrics: " + threadMetrics);
            
        } catch (Exception e) {
            System.err.println("Error monitoring threads: " + e.getMessage());
        }
    }
    
    private void monitorClassLoading() {
        try {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastClassCheck < 30000) { // Only check every 30 seconds
                return;
            }
            lastClassCheck = currentTime;
            
            long loadedClassCount = classLoadingMXBean.getLoadedClassCount();
            long totalLoadedClassCount = classLoadingMXBean.getTotalLoadedClassCount();
            long unloadedClassCount = classLoadingMXBean.getUnloadedClassCount();
            
            // Log class loading metrics
            Map<String, Object> classMetrics = new HashMap<>();
            classMetrics.put("loadedClassCount", loadedClassCount);
            classMetrics.put("totalLoadedClassCount", totalLoadedClassCount);
            classMetrics.put("unloadedClassCount", unloadedClassCount);
            
            System.out.println("Admin Service Class loading metrics: " + classMetrics);
            
        } catch (Exception e) {
            System.err.println("Error monitoring class loading: " + e.getMessage());
        }
    }
    
    private void monitorPerformance() {
        try {
            // CPU usage monitoring
            if (operatingSystemMXBean instanceof com.sun.management.OperatingSystemMXBean) {
                com.sun.management.OperatingSystemMXBean sunOSBean = (com.sun.management.OperatingSystemMXBean) operatingSystemMXBean;
                
                double cpuLoad = sunOSBean.getCpuLoad();
                if (cpuLoad > 0.9) {
                    System.out.println("WARNING: Admin Service high CPU usage detected: " + cpuLoad);
                }
                
                // System load average
                double systemLoadAverage = operatingSystemMXBean.getSystemLoadAverage();
                if (systemLoadAverage > 0.8) {
                    System.out.println("WARNING: Admin Service high system load detected: " + systemLoadAverage);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error monitoring performance: " + e.getMessage());
        }
    }
    
    private void monitorErrorRates() {
        try {
            long currentTime = System.currentTimeMillis();
            long totalRequestsCount = totalRequests.get();
            long totalErrorsCount = totalErrors.get();
            long totalWarningsCount = totalWarnings.get();
            
            if (totalRequestsCount > 0) {
                double errorRate = (double) totalErrorsCount / totalRequestsCount * 100;
                double warningRate = (double) totalWarningsCount / totalRequestsCount * 100;
                
                if (errorRate > 10) { // More than 10% error rate
                    System.err.println("CRITICAL: Admin Service error rate detected: " + errorRate + "%");
                } else if (errorRate > 5) { // More than 5% error rate
                    System.out.println("WARNING: Admin Service high error rate detected: " + errorRate + "%");
                }
                
                if (warningRate > 20) { // More than 20% warning rate
                    System.out.println("WARNING: Admin Service high warning rate detected: " + warningRate + "%");
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error monitoring error rates: " + e.getMessage());
        }
    }
    
    private void logDetailedSystemMetrics() {
        try {
            Map<String, Object> detailedMetrics = new HashMap<>();
            
            // Runtime metrics
            detailedMetrics.put("uptime", runtimeMXBean.getUptime());
            detailedMetrics.put("startTime", runtimeMXBean.getStartTime());
            
            // Memory metrics
            MemoryUsage heapMemoryUsage = memoryMXBean.getHeapMemoryUsage();
            detailedMetrics.put("heapUsed", heapMemoryUsage.getUsed());
            detailedMetrics.put("heapMax", heapMemoryUsage.getMax());
            detailedMetrics.put("heapCommitted", heapMemoryUsage.getCommitted());
            
            // Thread metrics
            detailedMetrics.put("threadCount", threadMXBean.getThreadCount());
            detailedMetrics.put("peakThreadCount", threadMXBean.getPeakThreadCount());
            
            // Performance metrics
            detailedMetrics.put("availableProcessors", operatingSystemMXBean.getAvailableProcessors());
            detailedMetrics.put("systemLoadAverage", operatingSystemMXBean.getSystemLoadAverage());
            
            // Error metrics
            detailedMetrics.put("totalRequests", totalRequests.get());
            detailedMetrics.put("totalErrors", totalErrors.get());
            detailedMetrics.put("totalWarnings", totalWarnings.get());
            
            System.out.println("Admin Service Detailed metrics: " + detailedMetrics);
            
        } catch (Exception e) {
            System.err.println("Error logging detailed metrics: " + e.getMessage());
        }
    }
    
    // Public methods for external components to report metrics
    
    public void incrementRequestCount() {
        totalRequests.incrementAndGet();
    }
    
    public void incrementErrorCount(String category) {
        totalErrors.incrementAndGet();
        errorCounters.computeIfAbsent(category, k -> new AtomicLong(0)).incrementAndGet();
        lastErrorTime.put(category, System.currentTimeMillis());
    }
    
    public void incrementWarningCount() {
        totalWarnings.incrementAndGet();
    }
    
    public void logRuntimeError(String category, String message, Exception exception, 
                               String userId, String sessionId, String requestId, String ipAddress, String userAgent) {
        incrementErrorCount(category);
        System.err.println("Admin Service Runtime Error [" + category + "]: " + message + " - " + exception.getMessage());
    }
    
    public void logRuntimeWarning(String category, String message, Map<String, Object> details,
                                 String userId, String sessionId, String requestId, String ipAddress, String userAgent) {
        incrementWarningCount();
        System.out.println("Admin Service Runtime Warning [" + category + "]: " + message + " - " + details);
    }
    
    // Health check methods
    
    public boolean isSystemHealthy() {
        try {
            // Check memory usage
            MemoryUsage heapMemoryUsage = memoryMXBean.getHeapMemoryUsage();
            long heapUsagePercent = (heapMemoryUsage.getUsed() * 100) / heapMemoryUsage.getMax();
            
            // Check thread count
            int threadCount = threadMXBean.getThreadCount();
            
            // Check error rate
            long totalRequestsCount = totalRequests.get();
            long totalErrorsCount = totalErrors.get();
            double errorRate = totalRequestsCount > 0 ? (double) totalErrorsCount / totalRequestsCount * 100 : 0;
            
            return heapUsagePercent < 90 && threadCount < 1000 && errorRate < 10;
            
        } catch (Exception e) {
            System.err.println("Error during health check: " + e.getMessage());
            return false;
        }
    }
    
    public Map<String, Object> getSystemHealthReport() {
        try {
            Map<String, Object> healthReport = new HashMap<>();
            
            // Overall health status
            healthReport.put("healthy", isSystemHealthy());
            
            // Memory health
            MemoryUsage heapMemoryUsage = memoryMXBean.getHeapMemoryUsage();
            long heapUsagePercent = (heapMemoryUsage.getUsed() * 100) / heapMemoryUsage.getMax();
            healthReport.put("memoryHealthy", heapUsagePercent < 90);
            healthReport.put("memoryUsagePercent", heapUsagePercent);
            
            // Thread health
            int threadCount = threadMXBean.getThreadCount();
            healthReport.put("threadHealthy", threadCount < 1000);
            healthReport.put("threadCount", threadCount);
            
            // Error rate health
            long totalRequestsCount = totalRequests.get();
            long totalErrorsCount = totalErrors.get();
            double errorRate = totalRequestsCount > 0 ? (double) totalErrorsCount / totalRequestsCount * 100 : 0;
            healthReport.put("errorRateHealthy", errorRate < 10);
            healthReport.put("errorRate", errorRate);
            
            // Performance health
            double systemLoadAverage = operatingSystemMXBean.getSystemLoadAverage();
            healthReport.put("performanceHealthy", systemLoadAverage < 0.8);
            healthReport.put("systemLoadAverage", systemLoadAverage);
            
            return healthReport;
            
        } catch (Exception e) {
            System.err.println("Error generating health report: " + e.getMessage());
            return Map.of("error", "Failed to generate health report: " + e.getMessage());
        }
    }
}
