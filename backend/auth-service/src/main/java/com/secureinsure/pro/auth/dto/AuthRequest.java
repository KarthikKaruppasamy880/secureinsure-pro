package com.secureinsure.pro.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    
    @NotBlank(message = "Username or email is required")
    private String usernameOrEmail;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private String mfaCode;
    
    private String biometricData;
    
    private String biometricType; // FACE, VOICE, FINGERPRINT
    
    public AuthRequest() {}
    
    public AuthRequest(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }
    
    // Getters and Setters
    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }
    
    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getMfaCode() {
        return mfaCode;
    }
    
    public void setMfaCode(String mfaCode) {
        this.mfaCode = mfaCode;
    }
    
    public String getBiometricData() {
        return biometricData;
    }
    
    public void setBiometricData(String biometricData) {
        this.biometricData = biometricData;
    }
    
    public String getBiometricType() {
        return biometricType;
    }
    
    public void setBiometricType(String biometricType) {
        this.biometricType = biometricType;
    }
} 