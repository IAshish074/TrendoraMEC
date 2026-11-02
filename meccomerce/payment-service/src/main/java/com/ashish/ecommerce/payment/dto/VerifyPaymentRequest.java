package com.ashish.ecommerce.payment.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPaymentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotBlank(message = "PayPal order ID / transaction ID is required")
    @JsonAlias({"paypalOrderId", "paymentId", "transactionId", "paypal_order_id", "orderID"})
    private String paypalOrderId;
}
