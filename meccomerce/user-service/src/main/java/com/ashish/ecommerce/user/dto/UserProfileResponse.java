package com.ashish.ecommerce.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String phone;
    private String avatarUrl;
    private String role;
    private List<AddressResponse> addresses;
}
