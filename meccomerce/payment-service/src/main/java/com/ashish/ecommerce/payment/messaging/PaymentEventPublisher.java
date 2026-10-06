package com.ashish.ecommerce.payment.messaging;

import com.ashish.ecommerce.common.dto.EventEnvelope;
import com.ashish.ecommerce.common.util.CorrelationUtils;
import com.ashish.ecommerce.payment.entity.Payment;
import com.ashish.ecommerce.payment.entity.Refund;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class PaymentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange:ecommerce.events}")
    private String exchange;

    public PaymentEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishPaymentCompleted(Payment payment) {
        try {
            EventEnvelope<Map<String, Object>> envelope = EventEnvelope.create(
                    "PAYMENT_COMPLETED",
                    "payment-service",
                    CorrelationUtils.getOrCreateCorrelationId(null),
                    Map.of(
                            "paymentId", payment.getId(),
                            "paymentNumber", payment.getPaymentNumber(),
                            "orderId", payment.getOrderId(),
                            "userId", payment.getUserId(),
                            "amount", payment.getAmount(),
                            "status", payment.getStatus().name()
                    )
            );
            rabbitTemplate.convertAndSend(exchange, "payment.completed", envelope);
            log.info("Published PAYMENT_COMPLETED event for orderId: {}", payment.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish PAYMENT_COMPLETED event for orderId: {}", payment.getOrderId(), e);
        }
    }

    public void publishPaymentFailed(Payment payment, String reason) {
        try {
            EventEnvelope<Map<String, Object>> envelope = EventEnvelope.create(
                    "PAYMENT_FAILED",
                    "payment-service",
                    CorrelationUtils.getOrCreateCorrelationId(null),
                    Map.of(
                            "paymentId", payment.getId(),
                            "orderId", payment.getOrderId(),
                            "reason", reason != null ? reason : "Payment verification failed"
                    )
            );
            rabbitTemplate.convertAndSend(exchange, "payment.failed", envelope);
            log.info("Published PAYMENT_FAILED event for orderId: {}", payment.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish PAYMENT_FAILED event for orderId: {}", payment.getOrderId(), e);
        }
    }

    public void publishRefundCompleted(Refund refund) {
        try {
            EventEnvelope<Map<String, Object>> envelope = EventEnvelope.create(
                    "REFUND_COMPLETED",
                    "payment-service",
                    CorrelationUtils.getOrCreateCorrelationId(null),
                    Map.of(
                            "refundId", refund.getId(),
                            "refundNumber", refund.getRefundNumber(),
                            "paymentId", refund.getPayment().getId(),
                            "amount", refund.getAmount()
                    )
            );
            rabbitTemplate.convertAndSend(exchange, "refund.completed", envelope);
            log.info("Published REFUND_COMPLETED event for refundId: {}", refund.getId());
        } catch (Exception e) {
            log.error("Failed to publish REFUND_COMPLETED event for refundId: {}", refund.getId(), e);
        }
    }
}
