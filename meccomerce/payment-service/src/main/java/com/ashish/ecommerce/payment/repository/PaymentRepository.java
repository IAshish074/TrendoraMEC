package com.ashish.ecommerce.payment.repository;

import com.ashish.ecommerce.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByPaymentNumber(String paymentNumber);
    Optional<Payment> findByProviderTransactionId(String providerTransactionId);
}
