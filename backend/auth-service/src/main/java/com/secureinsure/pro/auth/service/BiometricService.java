package com.secureinsure.pro.auth.service;

import com.secureinsure.pro.auth.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class BiometricService {
    
    @Value("${security.biometric.face-recognition-threshold}")
    private double faceRecognitionThreshold;
    
    @Value("${security.biometric.voice-recognition-threshold}")
    private double voiceRecognitionThreshold;
    
    public boolean verifyBiometric(User user, String biometricData, String biometricType) {
        if (!user.isBiometricEnabled()) {
            return false;
        }
        
        switch (biometricType.toUpperCase()) {
            case "FACE":
                return verifyFaceBiometric(user, biometricData);
            case "VOICE":
                return verifyVoiceBiometric(user, biometricData);
            case "FINGERPRINT":
                return verifyFingerprintBiometric(user, biometricData);
            default:
                return false;
        }
    }
    
    public void setupBiometric(User user, String biometricData, String biometricType) {
        // In a real application, you would process and encrypt the biometric data
        // For now, we'll store it as-is (in production, this should be encrypted)
        
        switch (biometricType.toUpperCase()) {
            case "FACE":
                user.setFaceData(biometricData);
                break;
            case "VOICE":
                user.setVoiceData(biometricData);
                break;
            case "FINGERPRINT":
                user.setFingerprintData(biometricData);
                break;
            default:
                throw new IllegalArgumentException("Unsupported biometric type: " + biometricType);
        }
        
        user.setBiometricEnabled(true);
    }
    
    private boolean verifyFaceBiometric(User user, String biometricData) {
        if (user.getFaceData() == null) {
            return false;
        }
        
        // In a real application, you would use AWS Rekognition or similar service
        // For now, we'll do a simple comparison (this is not secure for production)
        try {
            // Simulate face recognition comparison
            double similarity = compareBiometricData(user.getFaceData(), biometricData);
            return similarity >= faceRecognitionThreshold;
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean verifyVoiceBiometric(User user, String biometricData) {
        if (user.getVoiceData() == null) {
            return false;
        }
        
        // In a real application, you would use voice recognition services
        // For now, we'll do a simple comparison
        try {
            double similarity = compareBiometricData(user.getVoiceData(), biometricData);
            return similarity >= voiceRecognitionThreshold;
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean verifyFingerprintBiometric(User user, String biometricData) {
        if (user.getFingerprintData() == null) {
            return false;
        }
        
        // In a real application, you would use fingerprint recognition services
        // For now, we'll do a simple comparison
        try {
            double similarity = compareBiometricData(user.getFingerprintData(), biometricData);
            return similarity >= 0.8; // High threshold for fingerprint
        } catch (Exception e) {
            return false;
        }
    }
    
    private double compareBiometricData(String storedData, String providedData) {
        // This is a simplified comparison for demonstration
        // In production, you would use proper biometric comparison algorithms
        
        try {
            byte[] storedBytes = Base64.getDecoder().decode(storedData);
            byte[] providedBytes = Base64.getDecoder().decode(providedData);
            
            if (storedBytes.length != providedBytes.length) {
                return 0.0;
            }
            
            int matches = 0;
            for (int i = 0; i < storedBytes.length; i++) {
                if (storedBytes[i] == providedBytes[i]) {
                    matches++;
                }
            }
            
            return (double) matches / storedBytes.length;
            
        } catch (Exception e) {
            return 0.0;
        }
    }
    
    public boolean isBiometricEnabled(User user, String biometricType) {
        switch (biometricType.toUpperCase()) {
            case "FACE":
                return user.getFaceData() != null;
            case "VOICE":
                return user.getVoiceData() != null;
            case "FINGERPRINT":
                return user.getFingerprintData() != null;
            default:
                return false;
        }
    }
    
    public void removeBiometric(User user, String biometricType) {
        switch (biometricType.toUpperCase()) {
            case "FACE":
                user.setFaceData(null);
                break;
            case "VOICE":
                user.setVoiceData(null);
                break;
            case "FINGERPRINT":
                user.setFingerprintData(null);
                break;
        }
        
        // Check if any biometric data remains
        if (user.getFaceData() == null && user.getVoiceData() == null && user.getFingerprintData() == null) {
            user.setBiometricEnabled(false);
        }
    }
} 