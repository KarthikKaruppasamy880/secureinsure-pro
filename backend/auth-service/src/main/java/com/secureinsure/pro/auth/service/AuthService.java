package com.secureinsure.pro.auth.service;

import com.secureinsure.pro.auth.dto.AuthRequest;
import com.secureinsure.pro.auth.dto.AuthResponse;
import com.secureinsure.pro.auth.entity.User;
import com.secureinsure.pro.auth.entity.UserStatus;
import com.secureinsure.pro.auth.entity.UserType;
import com.secureinsure.pro.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private MfaService mfaService;
    
    @Autowired
    private BiometricService biometricService;
    
    public AuthResponse authenticate(AuthRequest request) {
        // Check if user exists
        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        // Check if account is locked
        if (user.isAccountLocked()) {
            if (user.getLockExpiresAt() != null && LocalDateTime.now().isBefore(user.getLockExpiresAt())) {
                throw new RuntimeException("Account is temporarily locked. Please try again later.");
            } else {
                // Unlock account if lock has expired
                user.resetFailedLoginAttempts();
                userRepository.save(user);
            }
        }
        
        // Authenticate with Spring Security
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
            );
            
            // Reset failed login attempts on successful authentication
            user.resetFailedLoginAttempts();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            
            // Check if MFA is required
            if (user.isMfaEnabled() && request.getMfaCode() == null) {
                return createMfaRequiredResponse(user);
            }
            
            // Verify MFA if provided
            if (user.isMfaEnabled() && request.getMfaCode() != null) {
                if (!mfaService.verifyCode(user.getMfaSecret(), request.getMfaCode())) {
                    throw new RuntimeException("Invalid MFA code");
                }
            }
            
            // Check biometric authentication if provided
            if (request.getBiometricData() != null && request.getBiometricType() != null) {
                if (!biometricService.verifyBiometric(user, request.getBiometricData(), request.getBiometricType())) {
                    throw new RuntimeException("Biometric verification failed");
                }
            }
            
            return createAuthResponse(user);
            
        } catch (Exception e) {
            // Increment failed login attempts
            user.incrementFailedLoginAttempts();
            
            // Lock account if too many failed attempts
            if (user.getFailedLoginAttempts() >= 5) {
                user.setAccountLocked(true);
                user.setLockExpiresAt(LocalDateTime.now().plusMinutes(30));
            }
            
            userRepository.save(user);
            throw new RuntimeException("Invalid credentials");
        }
    }
    
    public AuthResponse register(AuthRequest request) {
        // Check if user already exists
        if (userRepository.existsByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())) {
            throw new RuntimeException("User already exists");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsernameOrEmail());
        user.setEmail(request.getUsernameOrEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(""); // Will be updated later
        user.setLastName(""); // Will be updated later
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setUserType(UserType.CUSTOMER);
        
        user = userRepository.save(user);
        
        return createAuthResponse(user);
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        // Remove "Bearer " prefix if present
        if (refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        
        // Validate refresh token
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return createAuthResponse(user);
    }
    
    public void logout(String token) {
        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        // In a real application, you would add the token to a blacklist
        // For now, we'll just validate the token
        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Invalid token");
        }
    }
    
    public AuthResponse verifyMfa(String username, String mfaCode) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!mfaService.verifyCode(user.getMfaSecret(), mfaCode)) {
            throw new RuntimeException("Invalid MFA code");
        }
        
        return createAuthResponse(user);
    }
    
    public String setupMfa(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String secret = mfaService.generateSecret();
        user.setMfaSecret(secret);
        user.setMfaEnabled(true);
        userRepository.save(user);
        
        return mfaService.generateQrCode(secret, user.getEmail());
    }
    
    public AuthResponse verifyBiometric(String username, String biometricData, String biometricType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!biometricService.verifyBiometric(user, biometricData, biometricType)) {
            throw new RuntimeException("Biometric verification failed");
        }
        
        return createAuthResponse(user);
    }
    
    public String setupBiometric(String username, String biometricData, String biometricType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        biometricService.setupBiometric(user, biometricData, biometricType);
        userRepository.save(user);
        
        return "Biometric authentication setup successfully";
    }
    
    public boolean validateToken(String token) {
        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        return jwtService.isTokenValid(token);
    }
    
    public AuthResponse getUserInfo(String token) {
        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Invalid token");
        }
        
        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return createAuthResponse(user);
    }
    
    private AuthResponse createAuthResponse(User user) {
        AuthResponse response = new AuthResponse();
        
        // Generate tokens
        String accessToken = jwtService.generateTokenForUser(user.getUsername(), user.getId(), user.getUserType().name());
        String refreshToken = jwtService.generateRefreshToken(new org.springframework.security.core.userdetails.User(
            user.getUsername(), user.getPassword(), new HashSet<>()));
        
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(86400000L); // 24 hours
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setFullName(user.getFullName());
        response.setUserType(user.getUserType());
        response.setMfaEnabled(user.isMfaEnabled());
        response.setBiometricEnabled(user.isBiometricEnabled());
        response.setLastLogin(user.getLastLogin());
        
        // Set roles and permissions
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());
        response.setRoles(roles);
        
        Set<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> permission.getName())
                .collect(Collectors.toSet());
        response.setPermissions(permissions);
        
        return response;
    }
    
    private AuthResponse createMfaRequiredResponse(User user) {
        AuthResponse response = new AuthResponse();
        response.setMessage("MFA code required");
        response.setMfaEnabled(true);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        return response;
    }
} 