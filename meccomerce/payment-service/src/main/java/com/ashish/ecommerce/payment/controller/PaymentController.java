package com.ashish.ecommerce.payment.controller;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.payment.dto.*;
import com.ashish.ecommerce.payment.security.UserPrincipal;
import com.ashish.ecommerce.payment.service.PaymentService;
import com.ashish.ecommerce.payment.service.RefundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final RefundService refundService;

    public PaymentController(PaymentService paymentService, RefundService refundService) {
        this.paymentService = paymentService;
        this.refundService = refundService;
    }

    @PostMapping("/create")
    public ResponseEntity<CreatePaymentResponse> createPayment(@AuthenticationPrincipal UserPrincipal principal,
                                                               @Valid @RequestBody CreatePaymentRequest request) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        CreatePaymentResponse response = paymentService.createPayment(principal.getUserId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(@AuthenticationPrincipal UserPrincipal principal,
                                                         @Valid @RequestBody VerifyPaymentRequest request) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        PaymentResponse response = paymentService.verifyPayment(principal.getUserId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RefundResponse> refundPayment(@Valid @RequestBody RefundRequest request) {
        RefundResponse response = refundService.processRefund(request);
        return ResponseEntity.ok(response);
    }
}
