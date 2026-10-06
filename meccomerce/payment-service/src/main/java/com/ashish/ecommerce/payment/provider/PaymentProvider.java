package com.ashish.ecommerce.payment.provider;

import java.math.BigDecimal;

public interface PaymentProvider {

    record CreatePaymentResult(String providerOrderId, String approvalUrl) {}

    CreatePaymentResult createPaymentOrder(BigDecimal amount, String currency, Long orderId);

    boolean verifyPaymentOrder(String providerOrderId, BigDecimal expectedAmount);
}
