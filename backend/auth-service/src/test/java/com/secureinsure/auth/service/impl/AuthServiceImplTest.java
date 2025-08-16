package com.secureinsure.auth.service.impl;

import com.secureinsure.auth.dto.LoginRequest;
import com.secureinsure.auth.dto.LoginResponse;
import com.secureinsure.auth.dto.UserDto;
import com.secureinsure.auth.entity.User;
import com.secureinsure.auth.entity.UserStatus;
import com.secureinsure.auth.entity.UserType;
import com.secureinsure.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private UserDto testUserDto;
    private LoginRequest testLoginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .userType(UserType.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .phoneVerified(false)
                .mfaEnabled(false)
                .biometricEnabled(false)
                .roles(List.of("USER"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testUserDto = UserDto.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("SecurePass123!")
                .firstName("Test")
                .lastName("User")
                .userType(UserType.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .phoneVerified(false)
                .mfaEnabled(false)
                .biometricEnabled(false)
                .roles(List.of("USER"))
                .build();

        testLoginRequest = LoginRequest.builder()
                .username("testuser")
                .password("SecurePass123!")
                .rememberMe(false)
                .build();
    }

    @Test
    void login_Success() {
        when(userRepository.findByUsernameOrEmail("testuser", "testuser"))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("SecurePass123!", "encodedPassword"))
                .thenReturn(true);

        LoginResponse response = authService.login(testLoginRequest);

        assertNotNull(response);
        assertTrue(response.getSuccess());
        assertNotNull(response.getUser());
        assertEquals("testuser", response.getUser().getUsername());
        verify(userRepository).findByUsernameOrEmail("testuser", "testuser");
        verify(passwordEncoder).matches("SecurePass123!", "encodedPassword");
    }

    @Test
    void login_UserNotFound() {
        when(userRepository.findByUsernameOrEmail("nonexistent", "nonexistent"))
                .thenReturn(Optional.empty());

        LoginResponse response = authService.login(
                LoginRequest.builder().username("nonexistent").password("password").build());

        assertNotNull(response);
        assertFalse(response.getSuccess());
        assertNotNull(response.getErrorMessage());
        verify(userRepository).findByUsernameOrEmail("nonexistent", "nonexistent");
    }

    @Test
    void login_InvalidPassword() {
        when(userRepository.findByUsernameOrEmail("testuser", "testuser"))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword"))
                .thenReturn(false);

        LoginResponse response = authService.login(
                LoginRequest.builder().username("testuser").password("wrongpassword").build());

        assertNotNull(response);
        assertFalse(response.getSuccess());
        assertNotNull(response.getErrorMessage());
        verify(userRepository).findByUsernameOrEmail("testuser", "testuser");
        verify(passwordEncoder).matches("wrongpassword", "encodedPassword");
    }

    @Test
    void login_AccountLocked() {
        testUser.setAccountLocked(true);
        when(userRepository.findByUsernameOrEmail("testuser", "testuser"))
                .thenReturn(Optional.of(testUser));

        LoginResponse response = authService.login(testLoginRequest);

        assertNotNull(response);
        assertFalse(response.getSuccess());
        assertNotNull(response.getErrorMessage());
        verify(userRepository).findByUsernameOrEmail("testuser", "testuser");
    }

    @Test
    void createUser_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("SecurePass123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.createUser(testUserDto);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository).findByUsername("testuser");
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).encode("SecurePass123!");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_UsernameExists() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> authService.createUser(testUserDto));
        verify(userRepository).findByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUser_EmailExists() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(RuntimeException.class, () -> authService.createUser(testUserDto));
        verify(userRepository).findByUsername("testuser");
        verify(userRepository).findByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserDto result = authService.getUserById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("testuser", result.getUsername());
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.getUserById(999L));
        verify(userRepository).findById(999L);
    }

    @Test
    void updateUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto updatedDto = testUserDto.toBuilder()
                .firstName("Updated")
                .lastName("Name")
                .build();

        UserDto result = authService.updateUser(1L, updatedDto);

        assertNotNull(result);
        assertEquals("Updated", result.getFirstName());
        assertEquals("Name", result.getLastName());
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUser_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.updateUser(999L, testUserDto));
        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        authService.deleteUser(1L);

        verify(userRepository).findById(1L);
        verify(userRepository).delete(testUser);
    }

    @Test
    void deleteUser_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.deleteUser(999L));
        verify(userRepository).findById(999L);
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void getAllUsers_Success() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<User> userPage = new PageImpl<>(List.of(testUser), pageable, 1);
        when(userRepository.findAll(pageable)).thenReturn(userPage);

        Page<UserDto> result = authService.getAllUsers(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("testuser", result.getContent().get(0).getUsername());
        verify(userRepository).findAll(pageable);
    }

    @Test
    void searchUsers_Success() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<User> userPage = new PageImpl<>(List.of(testUser), pageable, 1);
        when(userRepository.findUsersByFilters(
                "test", null, null, null, null, null,
                null, null, null, null, null, null, null, pageable))
                .thenReturn(userPage);

        Page<UserDto> result = authService.searchUsers(
                "test", null, null, null, null, null,
                null, null, null, null, null, null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository).findUsersByFilters(
                "test", null, null, null, null, null,
                null, null, null, null, null, null, null, pageable);
    }

    @Test
    void getUsersByStatus_Success() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<User> userPage = new PageImpl<>(List.of(testUser), pageable, 1);
        when(userRepository.findByStatus(UserStatus.ACTIVE, pageable)).thenReturn(userPage);

        Page<UserDto> result = authService.getUsersByStatus(UserStatus.ACTIVE, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository).findByStatus(UserStatus.ACTIVE, pageable);
    }

    @Test
    void getUsersByType_Success() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<User> userPage = new PageImpl<>(List.of(testUser), pageable, 1);
        when(userRepository.findByUserType(UserType.CUSTOMER, pageable)).thenReturn(userPage);

        Page<UserDto> result = authService.getUsersByType(UserType.CUSTOMER, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository).findByUserType(UserType.CUSTOMER, pageable);
    }

    @Test
    void activateUser_Success() {
        testUser.setStatus(UserStatus.INACTIVE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.activateUser(1L);

        assertNotNull(result);
        assertEquals(UserStatus.ACTIVE, result.getStatus());
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void deactivateUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.deactivateUser(1L);

        assertNotNull(result);
        assertEquals(UserStatus.INACTIVE, result.getStatus());
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void lockUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.lockUser(1L);

        assertNotNull(result);
        assertTrue(result.getIsLocked());
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void unlockUser_Success() {
        testUser.setAccountLocked(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.unlockUser(1L);

        assertNotNull(result);
        assertFalse(result.getIsLocked());
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void enableMfa_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        Map<String, Object> result = authService.enableMfa(1L);

        assertNotNull(result);
        assertTrue(result.containsKey("secret"));
        assertTrue(result.containsKey("qrCode"));
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void disableMfa_Success() {
        testUser.setMfaEnabled(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.disableMfa(1L);

        assertNotNull(result);
        assertFalse(result.getMfaEnabled());
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void verifyMfaCode_Success() {
        testUser.setMfaEnabled(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        boolean result = authService.verifyMfaCode(1L, "123456");

        assertTrue(result);
        verify(userRepository).findById(1L);
    }

    @Test
    void enableBiometric_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.enableBiometric(1L);

        assertNotNull(result);
        assertTrue(result.getBiometricEnabled());
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void disableBiometric_Success() {
        testUser.setBiometricEnabled(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.disableBiometric(1L);

        assertNotNull(result);
        assertFalse(result.getBiometricEnabled());
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void changePassword_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        authService.changePassword(1L, "currentPassword", "newPassword");

        verify(userRepository).findById(1L);
        verify(passwordEncoder).matches("currentPassword", "encodedPassword");
        verify(passwordEncoder).encode("newPassword");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void changePassword_InvalidCurrentPassword() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> 
                authService.changePassword(1L, "wrongPassword", "newPassword"));
        verify(userRepository).findById(1L);
        verify(passwordEncoder).matches("wrongPassword", "encodedPassword");
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPassword_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.resetPassword("test@example.com");

        assertNotNull(result);
        verify(userRepository).findByEmail("test@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void forgotPassword_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        authService.forgotPassword("test@example.com");

        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void verifyEmail_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.verifyEmail(1L);

        assertNotNull(result);
        verify(userRepository).findById(1L);
    }

    @Test
    void verifyPhone_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto result = authService.verifyPhone(1L);

        assertNotNull(result);
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserStatistics_Success() {
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByStatus(UserStatus.ACTIVE)).thenReturn(80L);
        when(userRepository.countByStatus(UserStatus.INACTIVE)).thenReturn(10L);
        when(userRepository.countByStatus(UserStatus.SUSPENDED)).thenReturn(5L);
        when(userRepository.countByStatus(UserStatus.LOCKED)).thenReturn(5L);

        Map<String, Object> result = authService.getUserStatistics();

        assertNotNull(result);
        assertEquals(100L, result.get("totalUsers"));
        assertEquals(80L, result.get("activeUsers"));
        assertEquals(10L, result.get("inactiveUsers"));
        assertEquals(5L, result.get("suspendedUsers"));
        assertEquals(5L, result.get("lockedUsers"));
        verify(userRepository).count();
        verify(userRepository).countByStatus(UserStatus.ACTIVE);
        verify(userRepository).countByStatus(UserStatus.INACTIVE);
        verify(userRepository).countByStatus(UserStatus.SUSPENDED);
        verify(userRepository).countByStatus(UserStatus.LOCKED);
    }

    @Test
    void getLoginStatistics_Success() {
        Map<String, Object> result = authService.getLoginStatistics(
                LocalDateTime.now().minusDays(7), LocalDateTime.now());

        assertNotNull(result);
        assertTrue(result.containsKey("totalLogins"));
        assertTrue(result.containsKey("successfulLogins"));
        assertTrue(result.containsKey("failedLogins"));
        assertTrue(result.containsKey("uniqueUsers"));
    }

    // healthCheck method not available in AuthService interface

    @Test
    void validateUser_Success() {
        boolean result = authService.validateUser(testUserDto);

        assertTrue(result);
    }

    @Test
    void validateUser_InvalidUsername() {
        UserDto invalidUser = testUserDto.toBuilder().username("ab").build();

        boolean result = authService.validateUser(invalidUser);

        assertFalse(result);
    }

    @Test
    void validateUser_InvalidEmail() {
        UserDto invalidUser = testUserDto.toBuilder().email("invalid-email").build();

        boolean result = authService.validateUser(invalidUser);

        assertFalse(result);
    }

    @Test
    void validateUser_InvalidPassword() {
        UserDto invalidUser = testUserDto.toBuilder().password("weak").build();

        boolean result = authService.validateUser(invalidUser);

        assertFalse(result);
    }
} 