package com.secureinsure.pro.auth.controller;

import com.secureinsure.pro.auth.dto.AuthRequest;
import com.secureinsure.pro.auth.dto.AuthResponse;
import com.secureinsure.pro.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user with username/email and password")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Get new access token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and invalidate tokens")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/mfa/verify")
    @Operation(summary = "Verify MFA", description = "Verify multi-factor authentication code")
    public ResponseEntity<AuthResponse> verifyMfa(@RequestParam String username, @RequestParam String mfaCode) {
        AuthResponse response = authService.verifyMfa(username, mfaCode);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/mfa/setup")
    @Operation(summary = "Setup MFA", description = "Setup multi-factor authentication for user")
    public ResponseEntity<String> setupMfa(@RequestParam String username) {
        String qrCode = authService.setupMfa(username);
        return ResponseEntity.ok(qrCode);
    }
    
    @PostMapping("/biometric/verify")
    @Operation(summary = "Verify biometric", description = "Verify biometric authentication")
    public ResponseEntity<AuthResponse> verifyBiometric(@RequestParam String username, 
                                                      @RequestParam String biometricData,
                                                      @RequestParam String biometricType) {
        AuthResponse response = authService.verifyBiometric(username, biometricData, biometricType);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/biometric/setup")
    @Operation(summary = "Setup biometric", description = "Setup biometric authentication for user")
    public ResponseEntity<String> setupBiometric(@RequestParam String username,
                                               @RequestParam String biometricData,
                                               @RequestParam String biometricType) {
        String result = authService.setupBiometric(username, biometricData, biometricType);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/validate")
    @Operation(summary = "Validate token", description = "Validate JWT token")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(isValid);
    }
    
    @GetMapping("/user")
    @Operation(summary = "Get user info", description = "Get current user information")
    public ResponseEntity<AuthResponse> getUserInfo(@RequestHeader("Authorization") String token) {
        AuthResponse response = authService.getUserInfo(token);
        return ResponseEntity.ok(response);
    }
} 