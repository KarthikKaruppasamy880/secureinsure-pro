package com.secureinsure.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login Request")
public class LoginRequest {
    
    @NotBlank(message = "Username or email is required")
    @Schema(description = "Username or email", example = "john_doe")
    private String username;
    
    @NotBlank(message = "Password is required")
    @Schema(description = "Password", example = "SecurePass123!")
    private String password;
    
    @Schema(description = "Remember me", example = "false")
    private Boolean rememberMe = false;
    
    @Schema(description = "MFA code", example = "123456")
    private String mfaCode;
    
    @Schema(description = "Biometric token")
    private String biometricToken;
    
    @Schema(description = "Device fingerprint")
    private String deviceFingerprint;
    
    @Schema(description = "IP address")
    private String ipAddress;
    
    @Schema(description = "User agent")
    private String userAgent;
} 