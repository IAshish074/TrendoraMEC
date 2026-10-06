package com.ashish.ecommerce.user.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.user.dto.UpdateUserRoleRequest;
import com.ashish.ecommerce.user.dto.UserAdminResponse;
import com.ashish.ecommerce.user.entity.UserProfile;
import com.ashish.ecommerce.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final UserProfileRepository userProfileRepository;

    public AdminUserService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<UserAdminResponse> getAllUsers() {
        return userProfileRepository.findAll().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserAdminResponse updateUserRole(Long userId, UpdateUserRoleRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("User profile not found for ID: " + userId, 404));

        String role = request.getRole();
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }
        profile.setRole(role);
        UserProfile saved = userProfileRepository.save(profile);
        return mapToAdminResponse(saved);
    }

    @Transactional
    public void deleteUser(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("User profile not found for ID: " + userId, 404));
        userProfileRepository.delete(profile);
    }

    private UserAdminResponse mapToAdminResponse(UserProfile profile) {
        return UserAdminResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .email(profile.getEmail())
                .name(profile.getName())
                .phone(profile.getPhone())
                .avatarUrl(profile.getAvatarUrl())
                .role(profile.getRole())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
