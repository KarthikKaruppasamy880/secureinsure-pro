package com.secureinsure.claims;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ClaimsApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ClaimsApplication.class, args);
    }
} 