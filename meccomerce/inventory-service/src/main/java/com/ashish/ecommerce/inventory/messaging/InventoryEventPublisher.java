package com.ashish.ecommerce.inventory.messaging;

import com.ashish.ecommerce.common.dto.EventEnvelope;
import com.ashish.ecommerce.common.util.CorrelationUtils;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange:ecommerce.events}")
    private String exchange;

    public void publishInventoryReserved(Long orderId, String correlationId) {
        try {
            EventEnvelope<Map<String, Object>> envelope = EventEnvelope.create(
                    "INVENTORY_RESERVED",
                    "inventory-service",
                    CorrelationUtils.getOrCreateCorrelationId(correlationId),
                    Map.of("orderId", orderId, "status", "RESERVED")
            );
            rabbitTemplate.convertAndSend(exchange, "inventory.reserved", envelope);
            log.info("Published INVENTORY_RESERVED event for orderId: {}", orderId);
        } catch (Exception e) {
            log.error("Failed to publish INVENTORY_RESERVED event for orderId: {}", orderId, e);
        }
    }

    public void publishInventoryRejected(Long orderId, String reason, String correlationId) {
        try {
            EventEnvelope<Map<String, Object>> envelope = EventEnvelope.create(
                    "INVENTORY_REJECTED",
                    "inventory-service",
                    CorrelationUtils.getOrCreateCorrelationId(correlationId),
                    Map.of("orderId", orderId, "reason", reason != null ? reason : "Insufficient stock")
            );
            rabbitTemplate.convertAndSend(exchange, "inventory.rejected", envelope);
            log.info("Published INVENTORY_REJECTED event for orderId: {}", orderId);
        } catch (Exception e) {
            log.error("Failed to publish INVENTORY_REJECTED event for orderId: {}", orderId, e);
        }
    }
}
