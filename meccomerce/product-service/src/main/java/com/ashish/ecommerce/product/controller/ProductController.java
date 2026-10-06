package com.ashish.ecommerce.product.controller;

import com.ashish.ecommerce.common.dto.ApiResponse;
import com.ashish.ecommerce.product.dto.CreateProductRequest;
import com.ashish.ecommerce.product.dto.ProductFilterRequest;
import com.ashish.ecommerce.product.dto.ProductResponse;
import com.ashish.ecommerce.product.dto.UpdateProductRequest;
import com.ashish.ecommerce.product.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer sizePerPage) {

        ProductFilterRequest filter = ProductFilterRequest.builder()
                .search(search)
                .category(category)
                .categoryId(categoryId)
                .gender(gender)
                .color(color)
                .size(size)
                .material(material)
                .brand(brand)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .sortBy(sortBy)
                .page(page)
                .sizePerPage(sizePerPage)
                .build();

        return ResponseEntity.ok(productService.filterProducts(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse created = productService.createProduct(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody UpdateProductRequest request) {
        ProductResponse updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id, HttpServletRequest servletRequest) {
        productService.deleteProduct(id);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Product deleted successfully")
                .data("Deleted")
                .timestamp(LocalDateTime.now())
                .path(servletRequest.getRequestURI())
                .build();
        return ResponseEntity.ok(response);
    }
}
