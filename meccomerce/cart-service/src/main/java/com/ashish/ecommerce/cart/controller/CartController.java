package com.ashish.ecommerce.cart.controller;

import com.ashish.ecommerce.cart.dto.AddCartItemRequest;
import com.ashish.ecommerce.cart.dto.CartResponse;
import com.ashish.ecommerce.cart.dto.UpdateCartItemRequest;
import com.ashish.ecommerce.cart.security.UserPrincipal;
import com.ashish.ecommerce.cart.service.CartService;
import com.ashish.ecommerce.common.dto.ApiResponse;
import com.ashish.ecommerce.common.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        return ResponseEntity.ok(cartService.getCartByUserId(principal.getUserId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody AddCartItemRequest request) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        return ResponseEntity.ok(cartService.addItemToCart(principal.getUserId(), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItemQuantity(@AuthenticationPrincipal UserPrincipal principal,
                                                           @PathVariable Long itemId,
                                                           @Valid @RequestBody UpdateCartItemRequest request) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        return ResponseEntity.ok(cartService.updateItemQuantity(principal.getUserId(), itemId, request.getQuantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@AuthenticationPrincipal UserPrincipal principal,
                                                  @PathVariable Long itemId) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        return ResponseEntity.ok(cartService.removeItem(principal.getUserId(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> clearCart(@AuthenticationPrincipal UserPrincipal principal,
                                                         HttpServletRequest servletRequest) {
        if (principal == null) {
            throw new ApiException("Unauthorized user principal", 401);
        }
        cartService.clearCart(principal.getUserId());
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Cart cleared successfully")
                .data("Cleared")
                .timestamp(LocalDateTime.now())
                .path(servletRequest.getRequestURI())
                .build();
        return ResponseEntity.ok(response);
    }
}
