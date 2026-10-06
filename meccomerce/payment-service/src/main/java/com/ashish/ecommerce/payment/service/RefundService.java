package com.ashish.ecommerce.payment.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.payment.dto.RefundRequest;
import com.ashish.ecommerce.payment.dto.RefundResponse;
import com.ashish.ecommerce.payment.entity.Payment;
import com.ashish.ecommerce.payment.entity.PaymentStatus;
import com.ashish.ecommerce.payment.entity.Refund;
import com.ashish.ecommerce.payment.messaging.PaymentEventPublisher;
import com.ashish.ecommerce.payment.repository.PaymentRepository;
import com.ashish.ecommerce.payment.repository.RefundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RefundService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final PaymentEventPublisher eventPublisher;

    public RefundService(PaymentRepository paymentRepository,
                         RefundRepository refundRepository,
                         PaymentEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.refundRepository = refundRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public RefundResponse processRefund(RefundRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ApiException("Payment not found with ID: " + request.getPaymentId(), 404));

        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new ApiException("Cannot refund payment with status: " + payment.getStatus(), 400);
        }

        String refundNumber = "REF-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Refund refund = Refund.builder()
                .payment(payment)
                .refundNumber(refundNumber)
                .amount(request.getAmount())
                .reason(request.getReason())
                .status("COMPLETED")
                .build();

        Refund savedRefund = refundRepository.save(refund);

        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        eventPublisher.publishRefundCompleted(savedRefund);

        return RefundResponse.builder()
                .id(savedRefund.getId())
                .refundNumber(savedRefund.getRefundNumber())
                .paymentId(payment.getId())
                .amount(savedRefund.getAmount())
                .reason(savedRefund.getReason())
                .status(savedRefund.getStatus())
                .createdAt(savedRefund.getCreatedAt())
                .build();
    }
}
