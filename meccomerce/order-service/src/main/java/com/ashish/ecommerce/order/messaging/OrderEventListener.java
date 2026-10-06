package com.ashish.ecommerce.order.messaging;

import com.ashish.ecommerce.common.dto.EventEnvelope;
import com.ashish.ecommerce.order.entity.Order;
import com.ashish.ecommerce.order.entity.OrderStatus;
import com.ashish.ecommerce.order.entity.PaymentStatus;
import com.ashish.ecommerce.order.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "order.inventory-reserved.queue")
    @Transactional
    public void handleInventoryReserved(EventEnvelope<Map<String, Object>> envelope) {
        try {
            Map<String, Object> payload = envelope.getPayload();
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            log.info("Received INVENTORY_RESERVED for orderId: {}", orderId);

            orderRepository.findById(orderId).ifPresent(order -> {
                if (order.getStatus() == OrderStatus.PENDING) {
                    order.setStatus(OrderStatus.PAYMENT_PENDING);
                    orderRepository.save(order);
                }
            });
        } catch (Exception e) {
            log.error("Error handling INVENTORY_RESERVED event", e);
        }
    }

    @RabbitListener(queues = "order.inventory-rejected.queue")
    @Transactional
    public void handleInventoryRejected(EventEnvelope<Map<String, Object>> envelope) {
        try {
            Map<String, Object> payload = envelope.getPayload();
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            log.info("Received INVENTORY_REJECTED for orderId: {}", orderId);

            orderRepository.findById(orderId).ifPresent(order -> {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                eventPublisher.publishOrderCancelled(order);
            });
        } catch (Exception e) {
            log.error("Error handling INVENTORY_REJECTED event", e);
        }
    }

    @RabbitListener(queues = "order.payment-completed.queue")
    @Transactional
    public void handlePaymentCompleted(EventEnvelope<Map<String, Object>> envelope) {
        try {
            Map<String, Object> payload = envelope.getPayload();
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            log.info("Received PAYMENT_COMPLETED for orderId: {}", orderId);

            orderRepository.findById(orderId).ifPresent(order -> {
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
                eventPublisher.publishOrderConfirmed(order);
            });
        } catch (Exception e) {
            log.error("Error handling PAYMENT_COMPLETED event", e);
        }
    }

    @RabbitListener(queues = "order.payment-failed.queue")
    @Transactional
    public void handlePaymentFailed(EventEnvelope<Map<String, Object>> envelope) {
        try {
            Map<String, Object> payload = envelope.getPayload();
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            log.info("Received PAYMENT_FAILED for orderId: {}", orderId);

            orderRepository.findById(orderId).ifPresent(order -> {
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                eventPublisher.publishOrderCancelled(order);
            });
        } catch (Exception e) {
            log.error("Error handling PAYMENT_FAILED event", e);
        }
    }
}
