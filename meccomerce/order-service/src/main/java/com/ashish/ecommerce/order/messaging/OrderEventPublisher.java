package com.ashish.ecommerce.order.messaging;

import com.ashish.ecommerce.common.dto.EventEnvelope;
import com.ashish.ecommerce.common.util.CorrelationUtils;
import com.ashish.ecommerce.order.entity.Order;
import com.ashish.ecommerce.order.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange:ecommerce.events}")
    private String exchange;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemPayload {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderEventPayload {
        private Long orderId;
        private String orderNumber;
        private Long userId;
        private BigDecimal totalAmount;
        private String status;
        private List<OrderItemPayload> items;
    }

    public void publishOrderCreated(Order order) {
        publishEvent("ORDER_CREATED", "order.created", order);
    }

    public void publishOrderConfirmed(Order order) {
        publishEvent("ORDER_CONFIRMED", "order.confirmed", order);
    }

    public void publishOrderCancelled(Order order) {
        publishEvent("ORDER_CANCELLED", "order.cancelled", order);
    }

    public void publishOrderShipped(Order order) {
        publishEvent("ORDER_SHIPPED", "order.shipped", order);
    }

    public void publishOrderDelivered(Order order) {
        publishEvent("ORDER_DELIVERED", "order.delivered", order);
    }

    private void publishEvent(String eventType, String routingKey, Order order) {
        try {
            List<OrderItemPayload> itemPayloads = order.getItems().stream()
                    .map(i -> new OrderItemPayload(i.getProductId(), i.getQuantity(), i.getPriceAtPurchase()))
                    .collect(Collectors.toList());

            OrderEventPayload payload = OrderEventPayload.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .userId(order.getUserId())
                    .totalAmount(order.getTotalAmount())
                    .status(order.getStatus().name())
                    .items(itemPayloads)
                    .build();

            EventEnvelope<OrderEventPayload> envelope = EventEnvelope.create(
                    eventType,
                    "order-service",
                    CorrelationUtils.getOrCreateCorrelationId(null),
                    payload
            );

            rabbitTemplate.convertAndSend(exchange, routingKey, envelope);
            log.info("Published {} event for orderId: {}", eventType, order.getId());
        } catch (Exception e) {
            log.error("Failed to publish {} event for orderId: {}", eventType, order.getId(), e);
        }
    }
}
