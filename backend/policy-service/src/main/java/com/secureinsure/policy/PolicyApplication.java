package com.secureinsure.policy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PolicyApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(PolicyApplication.class, args);
    }
} 