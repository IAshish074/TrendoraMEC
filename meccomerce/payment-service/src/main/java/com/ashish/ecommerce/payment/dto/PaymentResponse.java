package com.ashish.ecommerce.payment.dto;

import com.ashish.ecommerce.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private String paymentNumber;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String provider;
    private String providerTransactionId;
    private PaymentStatus status;
    private LocalDateTime createdAt;
}
