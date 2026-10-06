package com.ashish.ecommerce.cart.service;

import com.ashish.ecommerce.cart.dto.*;
import com.ashish.ecommerce.cart.entity.Cart;
import com.ashish.ecommerce.cart.entity.CartItem;
import com.ashish.ecommerce.cart.repository.CartItemRepository;
import com.ashish.ecommerce.cart.repository.CartRepository;
import com.ashish.ecommerce.common.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse addItemToCart(Long userId, AddCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductIdAndSizeAndColor(
                cart.getId(), request.getProductId(), request.getSize(), request.getColor()
        );

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productId(request.getProductId())
                    .quantity(request.getQuantity())
                    .size(request.getSize())
                    .color(request.getColor())
                    .build();
            cart.getItems().add(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);
        return mapToResponse(updatedCart);
    }

    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long itemId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Cart not found", 404));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ApiException("Cart item not found with ID: " + itemId, 404));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        Cart updatedCart = cartRepository.save(cart);
        return mapToResponse(updatedCart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Cart not found", 404));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ApiException("Cart item not found with ID: " + itemId, 404));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        Cart updatedCart = cartRepository.save(cart);
        return mapToResponse(updatedCart);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    private CartResponse mapToResponse(Cart cart) {
        int totalItems = cart.getItems() != null ? cart.getItems().stream().mapToInt(CartItem::getQuantity).sum() : 0;
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .totalItems(totalItems)
                .items(cart.getItems() != null ? cart.getItems().stream().map(i -> CartItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .size(i.getSize())
                        .color(i.getColor())
                        .build()).collect(Collectors.toList()) : Collections.emptyList())
                .build();
    }
}
