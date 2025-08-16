package com.secureinsure.auth.dto;

import com.secureinsure.auth.entity.UserStatus;
import com.secureinsure.auth.entity.UserType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User Data Transfer Object")
public class UserDto {
    
    private Long id;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    @Schema(description = "Username", example = "john_doe")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$", 
             message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    @Schema(description = "Password", example = "SecurePass123!")
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    @Schema(description = "First name", example = "John")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    @Schema(description = "Last name", example = "Doe")
    private String lastName;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number must be valid")
    @Schema(description = "Phone number", example = "+1234567890")
    private String phoneNumber;
    
    @NotNull(message = "User type is required")
    @Schema(description = "User type", example = "CUSTOMER")
    private UserType userType;
    
    @Schema(description = "User status", example = "ACTIVE")
    private UserStatus status;
    
    @Schema(description = "User roles", example = "[\"USER\", \"AGENT\"]")
    private List<String> roles;
    
    @Schema(description = "MFA enabled", example = "false")
    private Boolean mfaEnabled;
    
    @Schema(description = "Biometric enabled", example = "false")
    private Boolean biometricEnabled;
    
    @Schema(description = "Last login time")
    private LocalDateTime lastLogin;
    
    @Schema(description = "Failed login attempts", example = "0")
    private Integer failedLoginAttempts;
    
    @Schema(description = "Account locked until")
    private LocalDateTime accountLockedUntil;
    
    @Schema(description = "Password changed at")
    private LocalDateTime passwordChangedAt;
    
    @Schema(description = "Email verified", example = "false")
    private Boolean emailVerified;
    
    @Schema(description = "Phone verified", example = "false")
    private Boolean phoneVerified;
    
    @Schema(description = "Profile picture URL")
    private String profilePictureUrl;
    
    @Schema(description = "Timezone", example = "UTC")
    private String timezone;
    
    @Schema(description = "Language", example = "en")
    private String language;
    
    @Schema(description = "User preferences (JSON)")
    private String preferences;
    
    @Schema(description = "Created at")
    private LocalDateTime createdAt;
    
    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;
    
    @Schema(description = "Created by user ID")
    private Long createdBy;
    
    @Schema(description = "Updated by user ID")
    private Long updatedBy;
    
    // Computed properties
    @Schema(description = "Full name", example = "John Doe")
    private String fullName;
    
    @Schema(description = "Is account locked", example = "false")
    private Boolean isLocked;
    
    @Schema(description = "Is account active", example = "true")
    private Boolean isActive;
    
    @Schema(description = "Days until password expires", example = "85")
    private Long daysUntilPasswordExpiry;
} 