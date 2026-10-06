package com.ashish.ecommerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequest {
    private String search;
    private String category;
    private Long categoryId;
    private String gender;
    private String color;
    private String size;
    private String material;
    private String brand;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String sortBy; // price_asc, price_desc, newest
    private Integer page;
    private Integer sizePerPage;
}
