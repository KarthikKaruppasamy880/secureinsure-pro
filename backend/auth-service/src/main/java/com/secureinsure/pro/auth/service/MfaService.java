package com.secureinsure.pro.auth.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

@Service
public class MfaService {
    
    @Value("${security.mfa.issuer}")
    private String issuer;
    
    private static final String ALGORITHM = "HmacSHA1";
    private static final int DIGITS = 6;
    private static final int PERIOD = 30; // seconds
    
    public String generateSecret() {
        // Generate a random 32-byte secret
        byte[] secret = new byte[32];
        new java.util.Random().nextBytes(secret);
        return Base64.getEncoder().encodeToString(secret);
    }
    
    public String generateCode(String secret) {
        return generateCode(secret, System.currentTimeMillis() / 1000 / PERIOD);
    }
    
    public String generateCode(String secret, long timeStep) {
        try {
            byte[] secretBytes = Base64.getDecoder().decode(secret);
            SecretKeySpec keySpec = new SecretKeySpec(secretBytes, ALGORITHM);
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(keySpec);
            
            byte[] timeBytes = new byte[8];
            for (int i = 7; i >= 0; i--) {
                timeBytes[i] = (byte) (timeStep & 0xFF);
                timeStep >>= 8;
            }
            
            byte[] hash = mac.doFinal(timeBytes);
            int offset = hash[hash.length - 1] & 0xF;
            int binary = ((hash[offset] & 0x7F) << 24) |
                        ((hash[offset + 1] & 0xFF) << 16) |
                        ((hash[offset + 2] & 0xFF) << 8) |
                        (hash[offset + 3] & 0xFF);
            
            int code = binary % (int) Math.pow(10, DIGITS);
            return String.format("%0" + DIGITS + "d", code);
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating MFA code", e);
        }
    }
    
    public boolean verifyCode(String secret, String code) {
        // Check current time step and adjacent time steps for clock skew
        long currentTimeStep = System.currentTimeMillis() / 1000 / PERIOD;
        
        for (int i = -1; i <= 1; i++) {
            String expectedCode = generateCode(secret, currentTimeStep + i);
            if (expectedCode.equals(code)) {
                return true;
            }
        }
        
        return false;
    }
    
    public String generateQrCode(String secret, String email) {
        try {
            String otpauthUrl = String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
                    issuer, email, secret, issuer, DIGITS, PERIOD);
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(otpauthUrl, BarcodeFormat.QR_CODE, 200, 200);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
            
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Error generating QR code", e);
        }
    }
    
    public String getOtpAuthUrl(String secret, String email) {
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
                issuer, email, secret, issuer, DIGITS, PERIOD);
    }
} 