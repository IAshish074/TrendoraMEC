package com.ashish.ecommerce.order.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
    @JsonAlias({"productId", "id"})
    private Long productId;

    @NotBlank(message = "Product name is required")
    @JsonAlias({"productName", "name", "title"})
    private String productName;

    private String productSku;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    @JsonAlias({"priceAtPurchase", "price", "unitPrice"})
    private BigDecimal priceAtPurchase;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @JsonAlias({"quantity", "qty", "count"})
    private Integer quantity;

    private String size;

    private String color;

    @JsonAlias({"imageUrl", "image", "thumbnail"})
    private String imageUrl;
}
