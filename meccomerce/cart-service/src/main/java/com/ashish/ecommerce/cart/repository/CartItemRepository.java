package com.ashish.ecommerce.cart.repository;

import com.ashish.ecommerce.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductIdAndSizeAndColor(Long cartId, Long productId, String size, String color);
}
