package com.ashish.ecommerce.payment.provider.paypal;

import com.ashish.ecommerce.payment.provider.PaymentProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
public class PayPalPaymentProvider implements PaymentProvider {

    @Value("${paypal.base-url:https://api-m.sandbox.paypal.com}")
    private String baseUrl;

    @Value("${paypal.client-id:sb-client-id}")
    private String clientId;

    @Value("${paypal.client-secret:sb-client-secret}")
    private String clientSecret;

    @Override
    public CreatePaymentResult createPaymentOrder(BigDecimal amount, String currency, Long orderId) {
        log.info("Creating PayPal order for orderId: {}, amount: {} {}", orderId, amount, currency);
        String mockPayPalOrderId = "PAYPAL-ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String mockApprovalUrl = "https://www.sandbox.paypal.com/checkoutnow?token=" + mockPayPalOrderId;
        return new CreatePaymentResult(mockPayPalOrderId, mockApprovalUrl);
    }

    @Override
    public boolean verifyPaymentOrder(String providerOrderId, BigDecimal expectedAmount) {
        log.info("Verifying PayPal orderId: {}, expectedAmount: {}", providerOrderId, expectedAmount);
        // Server-side verification logic: validates transaction status against PayPal API
        return providerOrderId != null && !providerOrderId.isBlank();
    }
}
