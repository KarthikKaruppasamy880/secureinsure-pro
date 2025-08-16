package com.secureinsure.policy.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ExamOneRequestDto {
    private String caseNumber;
    private String zinniaCaseId;
    private String policyNumber;
    
    // Insured Information
    private String insuredFirstName;
    private String insuredLastName;
    private LocalDate insuredDateOfBirth;
    private Integer insuredAge;
    private String insuredGender;
    private String insuredSsn;
    private String insuredEmail;
    private String insuredPhone;
    private String insuredAddress;
    private String insuredCity;
    private String insuredState;
    private String insuredZip;
    
    // Lab Request Details
    private String labType;
    private String urgency;
    private String specialInstructions;
    private String physicianName;
    private String physicianPhone;
    private String physicianEmail;
}
