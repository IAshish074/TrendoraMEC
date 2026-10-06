package com.ashish.ecommerce.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String phone;
    private String avatarUrl;
    private String role;
    private LocalDateTime createdAt;
}
