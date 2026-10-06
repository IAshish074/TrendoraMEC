package com.ashish.ecommerce.inventory.messaging;

import com.ashish.ecommerce.common.dto.EventEnvelope;
import com.ashish.ecommerce.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventListener {

    private final InventoryService inventoryService;

    @RabbitListener(queues = "inventory.order-created.queue")
    public void handleOrderCreated(EventEnvelope<Map<String, Object>> envelope) {
        try {
            Map<String, Object> payload = envelope.getPayload();
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

            log.info("Received ORDER_CREATED for orderId: {}, processing stock reservation", orderId);
            inventoryService.reserveStockForOrder(orderId, items, envelope.getCorrelationId());
        } catch (Exception e) {
            log.error("Failed to process ORDER_CREATED event in inventory-service", e);
        }
    }
}
