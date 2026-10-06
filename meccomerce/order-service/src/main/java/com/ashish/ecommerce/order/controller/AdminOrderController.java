package com.ashish.ecommerce.order.controller;

import com.ashish.ecommerce.order.dto.OrderResponse;
import com.ashish.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.ashish.ecommerce.order.security.UserPrincipal;
import com.ashish.ecommerce.order.service.OrderService;
import com.ashish.ecommerce.order.service.OrderStatusService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderStatusService orderStatusService;

    public AdminOrderController(OrderService orderService, OrderStatusService orderStatusService) {
        this.orderService = orderService;
        this.orderStatusService = orderStatusService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable Long id,
                                                           @Valid @RequestBody UpdateOrderStatusRequest request) {
        String changedBy = principal != null ? principal.getEmail() : "ADMIN";
        OrderResponse updated = orderStatusService.updateOrderStatus(id, request, changedBy);
        return ResponseEntity.ok(updated);
    }
}
