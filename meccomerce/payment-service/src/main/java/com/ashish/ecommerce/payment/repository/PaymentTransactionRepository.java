package com.ashish.ecommerce.payment.repository;

import com.ashish.ecommerce.payment.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByPaymentId(Long paymentId);
}
