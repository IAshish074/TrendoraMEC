package com.ashish.ecommerce.auth.service;

import com.ashish.ecommerce.auth.dto.*;
import com.ashish.ecommerce.auth.entity.PasswordResetToken;
import com.ashish.ecommerce.auth.entity.RefreshToken;
import com.ashish.ecommerce.auth.entity.Role;
import com.ashish.ecommerce.auth.entity.User;
import com.ashish.ecommerce.auth.messaging.AuthEventPublisher;
import com.ashish.ecommerce.auth.repository.PasswordResetTokenRepository;
import com.ashish.ecommerce.auth.repository.RoleRepository;
import com.ashish.ecommerce.auth.repository.UserRepository;
import com.ashish.ecommerce.common.exception.ApiException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthEventPublisher eventPublisher;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       AuthEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email is already registered: " + request.getEmail(), 409);
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .roles(Set.of(userRole))
                .build();

        User savedUser = userRepository.save(user);

        // Publish event for email sending
        eventPublisher.publishUserRegistered(savedUser.getId(), savedUser.getEmail(), savedUser.getName());

        List<String> roles = savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        String token = jwtService.generateAccessToken(savedUser.getId(), savedUser.getEmail(), roles);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        String mainRole = roles.contains("ROLE_ADMIN") ? "ROLE_ADMIN" : "ROLE_USER";

        return LoginResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(mainRole)
                .token(token)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password", 401));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("Invalid email or password", 401);
        }

        if (!user.isEnabled()) {
            throw new ApiException("Account is disabled", 403);
        }

        List<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        String token = jwtService.generateAccessToken(user.getId(), user.getEmail(), roles);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        String mainRole = roles.contains("ROLE_ADMIN") ? "ROLE_ADMIN" : "ROLE_USER";

        return LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(mainRole)
                .token(token)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new ApiException("Invalid refresh token", 401));

        User user = refreshToken.getUser();
        List<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        String newToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), roles);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        return RefreshTokenResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken.getToken())
                .build();
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenService.revokeToken(refreshTokenStr);
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);
            PasswordResetToken token = PasswordResetToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiryDate(LocalDateTime.now().plus(30, ChronoUnit.MINUTES))
                    .build();
            passwordResetTokenRepository.save(token);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ApiException("Invalid password reset token", 400));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(token);
            throw new ApiException("Password reset token expired", 400);
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(token);
    }
}
