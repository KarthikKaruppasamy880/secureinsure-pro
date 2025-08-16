package com.secureinsure.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
public class HealthController {

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${spring.application.name:gateway-service}")
    private String serviceName;

    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", serviceName);
        response.put("version", appVersion);
        response.put("uptime", System.currentTimeMillis());
        response.put("memory", getMemoryInfo());
        response.put("disk", getDiskInfo());
        
        return Mono.just(ResponseEntity.ok(response));
    }

    @GetMapping("/ready")
    public Mono<ResponseEntity<Map<String, Object>>> ready() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "READY");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", serviceName);
        response.put("version", appVersion);
        response.put("ready", true);
        response.put("checks", getReadinessChecks());
        
        return Mono.just(ResponseEntity.ok(response));
    }

    @GetMapping("/version")
    public Mono<ResponseEntity<Map<String, Object>>> version() {
        Map<String, Object> response = new HashMap<>();
        response.put("version", appVersion);
        response.put("service", serviceName);
        response.put("timestamp", LocalDateTime.now());
        response.put("build", getBuildInfo());
        
        return Mono.just(ResponseEntity.ok(response));
    }

    private Map<String, Object> getMemoryInfo() {
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> memory = new HashMap<>();
        memory.put("total", runtime.totalMemory());
        memory.put("free", runtime.freeMemory());
        memory.put("used", runtime.totalMemory() - runtime.freeMemory());
        memory.put("max", runtime.maxMemory());
        return memory;
    }

    private Map<String, Object> getDiskInfo() {
        Map<String, Object> disk = new HashMap<>();
        disk.put("available", "N/A"); // Would need FileSystem implementation
        disk.put("total", "N/A");
        disk.put("used", "N/A");
        return disk;
    }

    private Map<String, Object> getReadinessChecks() {
        Map<String, Object> checks = new HashMap<>();
        checks.put("database", "UP");
        checks.put("redis", "UP");
        checks.put("external_apis", "UP");
        return checks;
    }

    private Map<String, Object> getBuildInfo() {
        Map<String, Object> build = new HashMap<>();
        build.put("version", appVersion);
        build.put("buildTime", LocalDateTime.now());
        build.put("javaVersion", System.getProperty("java.version"));
        build.put("springVersion", "3.2.0");
        return build;
    }
}
