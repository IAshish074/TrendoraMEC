package com.ashish.ecommerce.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentResponse {
    private String paymentNumber;
    private Long orderId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String paypalOrderId;
    private String approvalUrl;
}
