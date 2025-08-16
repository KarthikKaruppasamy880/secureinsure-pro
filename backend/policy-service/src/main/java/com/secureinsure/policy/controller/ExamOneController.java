package com.secureinsure.policy.controller;

import com.secureinsure.policy.dto.ExamOneRequestDto;
import com.secureinsure.policy.dto.ExamOneResponseDto;
import com.secureinsure.policy.service.ExamOneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/examone")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "ExamOne Integration", description = "APIs for ExamOne lab integration")
public class ExamOneController {
    
    private final ExamOneService examOneService;
    
    @PostMapping("/lab-request")
    @Operation(summary = "Request lab work from ExamOne", description = "Sends a lab request to ExamOne for the specified insured")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<ExamOneResponseDto> requestLabWork(@Valid @RequestBody ExamOneRequestDto requestDto) {
        log.info("Received lab work request for insured: {} {}", 
                requestDto.getInsuredFirstName(), requestDto.getInsuredLastName());
        
        ExamOneResponseDto response = examOneService.requestLabWork(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/lab-results/{requestId}")
    @Operation(summary = "Get lab results from ExamOne", description = "Retrieves lab results from ExamOne for a specific request")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<ExamOneResponseDto> getLabResults(@PathVariable String requestId) {
        log.info("Fetching lab results for request ID: {}", requestId);
        
        ExamOneResponseDto response = examOneService.getLabResults(requestId);
        return ResponseEntity.ok(response);
    }
}
