package com.ashish.ecommerce.order.controller;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.order.dto.CreateOrderRequest;
import com.ashish.ecommerce.order.dto.OrderResponse;
import com.ashish.ecommerce.order.security.UserPrincipal;
import com.ashish.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@AuthenticationPrincipal UserPrincipal principal,
                                                     @Valid @RequestBody CreateOrderRequest request) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        OrderResponse response = orderService.createOrder(principal.getUserId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        return ResponseEntity.ok(orderService.getMyOrders(principal.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long id) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.getOrderById(id, principal.getUserId(), isAdmin));
    }
}
