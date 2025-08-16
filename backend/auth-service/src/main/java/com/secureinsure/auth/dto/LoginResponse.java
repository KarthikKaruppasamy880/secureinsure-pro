package com.secureinsure.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login Response")
public class LoginResponse {
    
    @Schema(description = "Access token")
    private String accessToken;
    
    @Schema(description = "Refresh token")
    private String refreshToken;
    
    @Schema(description = "Token type", example = "Bearer")
    private String tokenType = "Bearer";
    
    @Schema(description = "Access token expiration time")
    private LocalDateTime accessTokenExpiresAt;
    
    @Schema(description = "Refresh token expiration time")
    private LocalDateTime refreshTokenExpiresAt;
    
    @Schema(description = "User information")
    private UserDto user;
    
    @Schema(description = "User roles")
    private List<String> roles;
    
    @Schema(description = "MFA required", example = "false")
    private Boolean mfaRequired = false;
    
    @Schema(description = "Biometric required", example = "false")
    private Boolean biometricRequired = false;
    
    @Schema(description = "Email verification required", example = "false")
    private Boolean emailVerificationRequired = false;
    
    @Schema(description = "Phone verification required", example = "false")
    private Boolean phoneVerificationRequired = false;
    
    @Schema(description = "Password change required", example = "false")
    private Boolean passwordChangeRequired = false;
    
    @Schema(description = "Session ID")
    private String sessionId;
    
    @Schema(description = "Last login time")
    private LocalDateTime lastLogin;
    
    @Schema(description = "Login success", example = "true")
    private Boolean success = true;
    
    @Schema(description = "Error message")
    private String errorMessage;
} 