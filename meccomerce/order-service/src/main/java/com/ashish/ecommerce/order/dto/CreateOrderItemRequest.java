package com.ashish.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Product name is required")
    private String productName;

    private String productSku;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal priceAtPurchase;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    private String size;

    private String color;

    private String imageUrl;
}
