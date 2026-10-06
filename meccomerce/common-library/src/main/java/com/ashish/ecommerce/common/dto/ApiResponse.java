package com.ashish.ecommerce.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String path;
    private String correlationId;
    private List<ErrorDetail> errors;

    public static <T> ApiResponse<T> success(T data, String message, String path, String correlationId) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .path(path)
                .correlationId(correlationId)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String path, String correlationId, List<ErrorDetail> errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .path(path)
                .correlationId(correlationId)
                .errors(errors)
                .build();
    }
}
