package com.ashish.ecommerce.payment.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.payment.dto.*;
import com.ashish.ecommerce.payment.entity.Payment;
import com.ashish.ecommerce.payment.entity.PaymentStatus;
import com.ashish.ecommerce.payment.entity.PaymentTransaction;
import com.ashish.ecommerce.payment.messaging.PaymentEventPublisher;
import com.ashish.ecommerce.payment.provider.PaymentProvider;
import com.ashish.ecommerce.payment.repository.PaymentRepository;
import com.ashish.ecommerce.payment.repository.PaymentTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final PaymentProvider paymentProvider;
    private final PaymentEventPublisher eventPublisher;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentTransactionRepository transactionRepository,
                          PaymentProvider paymentProvider,
                          PaymentEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.transactionRepository = transactionRepository;
        this.paymentProvider = paymentProvider;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public CreatePaymentResponse createPayment(Long userId, CreatePaymentRequest request) {
        Optional<Payment> existingOpt = paymentRepository.findByOrderId(request.getOrderId());
        if (existingOpt.isPresent()) {
            Payment existing = existingOpt.get();
            if (existing.getStatus() == PaymentStatus.PAID) {
                throw new ApiException("Payment has already been completed for order ID: " + request.getOrderId(), 400);
            }
            // Return existing pending payment details
            PaymentProvider.CreatePaymentResult result = paymentProvider.createPaymentOrder(existing.getAmount(), existing.getCurrency(), existing.getOrderId());
            return CreatePaymentResponse.builder()
                    .paymentNumber(existing.getPaymentNumber())
                    .orderId(existing.getOrderId())
                    .amount(existing.getAmount())
                    .currency(existing.getCurrency())
                    .status(existing.getStatus().name())
                    .paypalOrderId(result.providerOrderId())
                    .approvalUrl(result.approvalUrl())
                    .build();
        }

        String paymentNumber = "PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String currency = request.getCurrency() != null ? request.getCurrency() : "USD";
        String method = request.getPaymentMethod() != null ? request.getPaymentMethod() : "PAYPAL";

        PaymentProvider.CreatePaymentResult providerResult = paymentProvider.createPaymentOrder(request.getAmount(), currency, request.getOrderId());

        Payment payment = Payment.builder()
                .paymentNumber(paymentNumber)
                .orderId(request.getOrderId())
                .userId(userId)
                .amount(request.getAmount())
                .currency(currency)
                .paymentMethod(method)
                .provider("PAYPAL")
                .providerTransactionId(providerResult.providerOrderId())
                .status(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);

        transactionRepository.save(PaymentTransaction.builder()
                .payment(saved)
                .transactionType("CREATE")
                .status("PENDING")
                .rawResponse("Created PayPal order: " + providerResult.providerOrderId())
                .build());

        return CreatePaymentResponse.builder()
                .paymentNumber(saved.getPaymentNumber())
                .orderId(saved.getOrderId())
                .amount(saved.getAmount())
                .currency(saved.getCurrency())
                .status(saved.getStatus().name())
                .paypalOrderId(providerResult.providerOrderId())
                .approvalUrl(providerResult.approvalUrl())
                .build();
    }

    @Transactional
    public PaymentResponse verifyPayment(Long userId, VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ApiException("Payment record not found for order ID: " + request.getOrderId(), 404));

        // Idempotency check: if already paid, return
        if (payment.getStatus() == PaymentStatus.PAID) {
            return mapToResponse(payment);
        }

        boolean verified = paymentProvider.verifyPaymentOrder(request.getPaypalOrderId(), payment.getAmount());

        if (verified) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setProviderTransactionId(request.getPaypalOrderId());
            Payment saved = paymentRepository.save(payment);

            transactionRepository.save(PaymentTransaction.builder()
                    .payment(saved)
                    .transactionType("VERIFY")
                    .status("SUCCESS")
                    .rawResponse("Verified PayPal transaction: " + request.getPaypalOrderId())
                    .build());

            eventPublisher.publishPaymentCompleted(saved);
            return mapToResponse(saved);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            Payment saved = paymentRepository.save(payment);

            transactionRepository.save(PaymentTransaction.builder()
                    .payment(saved)
                    .transactionType("VERIFY")
                    .status("FAILED")
                    .rawResponse("Verification failed for PayPal transaction: " + request.getPaypalOrderId())
                    .build());

            eventPublisher.publishPaymentFailed(saved, "PayPal verification failed");
            throw new ApiException("Payment verification failed with provider", 400);
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ApiException("Payment not found for order ID: " + orderId, 404));
        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentNumber(payment.getPaymentNumber())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .provider(payment.getProvider())
                .providerTransactionId(payment.getProviderTransactionId())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
