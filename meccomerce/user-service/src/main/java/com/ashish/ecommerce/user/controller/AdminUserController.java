package com.ashish.ecommerce.user.controller;

import com.ashish.ecommerce.common.dto.ApiResponse;
import com.ashish.ecommerce.user.dto.UpdateUserRoleRequest;
import com.ashish.ecommerce.user.dto.UserAdminResponse;
import com.ashish.ecommerce.user.service.AdminUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers() {
        List<UserAdminResponse> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAdminResponse> updateUserRole(@PathVariable Long id,
                                                            @Valid @RequestBody UpdateUserRoleRequest request) {
        UserAdminResponse updated = adminUserService.updateUserRole(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id, HttpServletRequest servletRequest) {
        adminUserService.deleteUser(id);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("User profile deleted successfully")
                .data("Deleted")
                .timestamp(LocalDateTime.now())
                .path(servletRequest.getRequestURI())
                .build();
        return ResponseEntity.ok(response);
    }
}
