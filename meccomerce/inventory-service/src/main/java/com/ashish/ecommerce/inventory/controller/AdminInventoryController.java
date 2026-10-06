package com.ashish.ecommerce.inventory.controller;

import com.ashish.ecommerce.inventory.dto.InventoryResponse;
import com.ashish.ecommerce.inventory.dto.StockAdjustmentRequest;
import com.ashish.ecommerce.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class AdminInventoryController {

    private final InventoryService inventoryService;

    public AdminInventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryResponse> adjustStock(@Valid @RequestBody StockAdjustmentRequest request) {
        InventoryResponse response = inventoryService.adjustStock(request);
        return ResponseEntity.ok(response);
    }
}
