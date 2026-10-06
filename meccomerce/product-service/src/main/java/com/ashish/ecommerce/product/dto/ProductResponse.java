package com.ashish.ecommerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String brand;
    private String material;
    private String categoryName;
    private Long categoryId;
    private String gender;
    private List<String> sizes;
    private List<String> colors;
    private boolean isFeatured;
    private boolean isActive;
    private List<ProductImageDto> images;
}
