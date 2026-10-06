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
public class UpdateProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String brand;
    private String material;
    private Long categoryId;
    private String gender;
    private List<String> sizes;
    private List<String> colors;
    private Boolean isFeatured;
    private Boolean isActive;
    private List<String> imageUrls;
}
