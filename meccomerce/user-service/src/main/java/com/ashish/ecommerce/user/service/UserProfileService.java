package com.ashish.ecommerce.user.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.user.dto.AddressResponse;
import com.ashish.ecommerce.user.dto.UpdateUserProfileRequest;
import com.ashish.ecommerce.user.dto.UserProfileResponse;
import com.ashish.ecommerce.user.entity.UserProfile;
import com.ashish.ecommerce.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional
    public UserProfileResponse getOrCreateProfile(Long userId, String email, String name) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> userProfileRepository.save(
                        UserProfile.builder()
                                .userId(userId)
                                .email(email != null ? email : "user" + userId + "@example.com")
                                .name(name != null ? name : "User")
                                .role("ROLE_USER")
                                .build()
                ));
        return mapToResponse(profile);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, String email, UpdateUserProfileRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder()
                        .userId(userId)
                        .email(email != null ? email : "user" + userId + "@example.com")
                        .role("ROLE_USER")
                        .build());

        if (request.getName() != null && !request.getName().isBlank()) {
            profile.setName(request.getName());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }

        UserProfile saved = userProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    private UserProfileResponse mapToResponse(UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .email(profile.getEmail())
                .name(profile.getName())
                .phone(profile.getPhone())
                .avatarUrl(profile.getAvatarUrl())
                .role(profile.getRole())
                .addresses(profile.getAddresses() != null ? profile.getAddresses().stream().map(a -> AddressResponse.builder()
                        .id(a.getId())
                        .street(a.getStreet())
                        .city(a.getCity())
                        .state(a.getState())
                        .zipCode(a.getZipCode())
                        .country(a.getCountry())
                        .isDefault(a.isDefault())
                        .build()).collect(Collectors.toList()) : Collections.emptyList())
                .build();
    }
}
