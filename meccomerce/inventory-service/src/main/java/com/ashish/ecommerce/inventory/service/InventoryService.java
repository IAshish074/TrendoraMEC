package com.ashish.ecommerce.inventory.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.inventory.dto.InventoryResponse;
import com.ashish.ecommerce.inventory.dto.StockAdjustmentRequest;
import com.ashish.ecommerce.inventory.entity.InventoryItem;
import com.ashish.ecommerce.inventory.entity.StockReservation;
import com.ashish.ecommerce.inventory.messaging.InventoryEventPublisher;
import com.ashish.ecommerce.inventory.repository.InventoryRepository;
import com.ashish.ecommerce.inventory.repository.StockReservationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockReservationRepository reservationRepository;
    private final InventoryEventPublisher eventPublisher;

    public InventoryService(InventoryRepository inventoryRepository,
                            StockReservationRepository reservationRepository,
                            InventoryEventPublisher eventPublisher) {
        this.inventoryRepository = inventoryRepository;
        this.reservationRepository = reservationRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductId(Long productId) {
        InventoryItem item = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> InventoryItem.builder()
                        .productId(productId)
                        .availableQuantity(0)
                        .reservedQuantity(0)
                        .build());
        return mapToResponse(item);
    }

    @Transactional
    public InventoryResponse adjustStock(StockAdjustmentRequest request) {
        InventoryItem item = inventoryRepository.findByProductId(request.getProductId())
                .orElseGet(() -> InventoryItem.builder()
                        .productId(request.getProductId())
                        .reservedQuantity(0)
                        .build());

        item.setAvailableQuantity(request.getAvailableQuantity());
        InventoryItem saved = inventoryRepository.save(item);
        return mapToResponse(saved);
    }

    @Transactional
    public void reserveStockForOrder(Long orderId, List<Map<String, Object>> items, String correlationId) {
        if (items == null || items.isEmpty()) {
            eventPublisher.publishInventoryRejected(orderId, "Empty items in order", correlationId);
            return;
        }

        // 1. Check stock availability for all items
        for (Map<String, Object> itemMap : items) {
            Long productId = Long.valueOf(itemMap.get("productId").toString());
            Integer qty = Integer.valueOf(itemMap.get("quantity").toString());

            InventoryItem inventory = inventoryRepository.findByProductId(productId).orElse(null);
            if (inventory == null || inventory.getAvailableQuantity() < qty) {
                log.warn("Insufficient stock for productId: {}, requested: {}, available: {}",
                        productId, qty, inventory != null ? inventory.getAvailableQuantity() : 0);
                eventPublisher.publishInventoryRejected(orderId, "Insufficient stock for product ID " + productId, correlationId);
                return;
            }
        }

        // 2. Reserve stock
        for (Map<String, Object> itemMap : items) {
            Long productId = Long.valueOf(itemMap.get("productId").toString());
            Integer qty = Integer.valueOf(itemMap.get("quantity").toString());

            InventoryItem inventory = inventoryRepository.findByProductId(productId).get();
            inventory.setAvailableQuantity(inventory.getAvailableQuantity() - qty);
            inventory.setReservedQuantity(inventory.getReservedQuantity() + qty);
            inventoryRepository.save(inventory);

            reservationRepository.save(StockReservation.builder()
                    .orderId(orderId)
                    .productId(productId)
                    .quantity(qty)
                    .status("RESERVED")
                    .build());
        }

        eventPublisher.publishInventoryReserved(orderId, correlationId);
    }

    @Transactional
    public void releaseStockForOrder(Long orderId) {
        List<StockReservation> reservations = reservationRepository.findByOrderIdAndStatus(orderId, "RESERVED");
        for (StockReservation res : reservations) {
            inventoryRepository.findByProductId(res.getProductId()).ifPresent(inv -> {
                inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - res.getQuantity()));
                inv.setAvailableQuantity(inv.getAvailableQuantity() + res.getQuantity());
                inventoryRepository.save(inv);
            });
            res.setStatus("RELEASED");
            reservationRepository.save(res);
        }
    }

    private InventoryResponse mapToResponse(InventoryItem item) {
        return InventoryResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .availableQuantity(item.getAvailableQuantity())
                .reservedQuantity(item.getReservedQuantity())
                .build();
    }
}
