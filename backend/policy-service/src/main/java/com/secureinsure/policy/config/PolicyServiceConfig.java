package com.secureinsure.policy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.beans.factory.annotation.Value;
import java.time.Duration;

@Configuration
public class PolicyServiceConfig {
    
    @Value("${examone.api.timeout:30000}")
    private int examOneTimeout;
    
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(examOneTimeout))
                .setReadTimeout(Duration.ofMillis(examOneTimeout))
                .build();
    }
}
