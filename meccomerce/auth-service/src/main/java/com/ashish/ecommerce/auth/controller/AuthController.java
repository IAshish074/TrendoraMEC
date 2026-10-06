package com.ashish.ecommerce.auth.controller;

import com.ashish.ecommerce.auth.dto.*;
import com.ashish.ecommerce.auth.service.AuthService;
import com.ashish.ecommerce.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@RequestBody(required = false) RefreshTokenRequest request, HttpServletRequest servletRequest) {
        if (request != null && request.getRefreshToken() != null) {
            authService.logout(request.getRefreshToken());
        }
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Successfully logged out")
                .data("Logged out")
                .timestamp(LocalDateTime.now())
                .path(servletRequest.getRequestURI())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest servletRequest) {
        authService.forgotPassword(request);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("If an account with that email exists, a password reset link has been sent.")
                .data("Email processed")
                .timestamp(LocalDateTime.now())
                .path(servletRequest.getRequestURI())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest servletRequest) {
        authService.resetPassword(request);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Password has been reset successfully.")
                .data("Password reset")
                .timestamp(LocalDateTime.now())
                .path(servletRequest.getRequestURI())
                .build();
        return ResponseEntity.ok(response);
    }
}
