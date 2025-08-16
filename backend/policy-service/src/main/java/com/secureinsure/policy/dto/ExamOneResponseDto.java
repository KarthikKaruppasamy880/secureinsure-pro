package com.secureinsure.policy.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExamOneResponseDto {
    private String requestId;
    private String status;
    private String message;
    private LocalDateTime requestDate;
    private LocalDateTime responseDate;
    
    // Lab Results
    private List<LabResultDto> labResults;
    private String overallAssessment;
    private String recommendations;
    
    // Error Information
    private String errorCode;
    private String errorMessage;
    
    @Data
    public static class LabResultDto {
        private String testName;
        private String result;
        private String unit;
        private String referenceRange;
        private String flag;
        private String notes;
        private LocalDateTime testDate;
    }
}
