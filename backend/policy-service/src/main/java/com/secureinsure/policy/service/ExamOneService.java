package com.secureinsure.policy.service;

import com.secureinsure.policy.dto.ExamOneRequestDto;
import com.secureinsure.policy.dto.ExamOneResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamOneService {
    
    private final RestTemplate restTemplate;
    
    @Value("${examone.api.base-url}")
    private String examOneBaseUrl;
    
    @Value("${examone.api.username}")
    private String username;
    
    @Value("${examone.api.password}")
    private String password;
    
    @Value("${examone.api.api-key}")
    private String apiKey;
    
    public ExamOneResponseDto requestLabWork(ExamOneRequestDto requestDto) {
        log.info("Requesting lab work from ExamOne for insured: {} {}", 
                requestDto.getInsuredFirstName(), requestDto.getInsuredLastName());
        
        try {
            // Create headers with authentication
            HttpHeaders headers = createAuthHeaders();
            
            // Create request entity
            HttpEntity<ExamOneRequestDto> requestEntity = new HttpEntity<>(requestDto, headers);
            
            // Make API call to ExamOne
            String url = examOneBaseUrl + "/api/v1/lab-requests";
            ResponseEntity<ExamOneResponseDto> response = restTemplate.exchange(
                    url, 
                    HttpMethod.POST, 
                    requestEntity, 
                    ExamOneResponseDto.class
            );
            
            log.info("Successfully received response from ExamOne for lab request");
            return response.getBody();
            
        } catch (Exception e) {
            log.error("Error requesting lab work from ExamOne: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to request lab work from ExamOne", e);
        }
    }
    
    public ExamOneResponseDto getLabResults(String requestId) {
        log.info("Fetching lab results from ExamOne for request ID: {}", requestId);
        
        try {
            // Create headers with authentication
            HttpHeaders headers = createAuthHeaders();
            
            // Create request entity
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            
            // Make API call to ExamOne
            String url = examOneBaseUrl + "/api/v1/lab-requests/" + requestId + "/results";
            ResponseEntity<ExamOneResponseDto> response = restTemplate.exchange(
                    url, 
                    HttpMethod.GET, 
                    requestEntity, 
                    ExamOneResponseDto.class
            );
            
            log.info("Successfully received lab results from ExamOne");
            return response.getBody();
            
        } catch (Exception e) {
            log.error("Error fetching lab results from ExamOne: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch lab results from ExamOne", e);
        }
    }
    
    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("X-Username", username);
        headers.set("X-Password", password);
        headers.set("Content-Type", "application/json");
        return headers;
    }
}
