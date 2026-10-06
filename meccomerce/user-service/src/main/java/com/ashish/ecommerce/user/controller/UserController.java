package com.ashish.ecommerce.user.controller;

import com.ashish.ecommerce.common.dto.ApiResponse;
import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.user.dto.AddressResponse;
import com.ashish.ecommerce.user.dto.CreateAddressRequest;
import com.ashish.ecommerce.user.dto.UpdateUserProfileRequest;
import com.ashish.ecommerce.user.dto.UserProfileResponse;
import com.ashish.ecommerce.user.security.UserPrincipal;
import com.ashish.ecommerce.user.service.AddressService;
import com.ashish.ecommerce.user.service.UserProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;
    private final AddressService addressService;

    public UserController(UserProfileService userProfileService, AddressService addressService) {
        this.userProfileService = userProfileService;
        this.addressService = addressService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        UserProfileResponse response = userProfileService.getOrCreateProfile(principal.getUserId(), principal.getEmail(), "User");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                              @Valid @RequestBody UpdateUserProfileRequest request) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        UserProfileResponse response = userProfileService.updateProfile(principal.getUserId(), principal.getEmail(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<AddressResponse>> getAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        return ResponseEntity.ok(addressService.getUserAddresses(principal.getUserId()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<AddressResponse> addAddress(@AuthenticationPrincipal UserPrincipal principal,
                                                       @Valid @RequestBody CreateAddressRequest request) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        AddressResponse response = addressService.addAddress(principal.getUserId(), principal.getEmail(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAddress(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable Long id,
                                                             HttpServletRequest servletRequest) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        addressService.deleteAddress(principal.getUserId(), id);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Address deleted successfully")
                .data("Deleted")
                .timestamp(LocalDateTime.now())
                .path(servletRequest.getRequestURI())
                .build();
        return ResponseEntity.ok(response);
    }
}
