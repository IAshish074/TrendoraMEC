package com.ashish.ecommerce.product.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.product.dto.*;
import com.ashish.ecommerce.product.entity.Category;
import com.ashish.ecommerce.product.entity.Product;
import com.ashish.ecommerce.product.entity.ProductImage;
import com.ashish.ecommerce.product.repository.CategoryRepository;
import com.ashish.ecommerce.product.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> filterProducts(ProductFilterRequest filter) {
        int page = filter.getPage() != null && filter.getPage() >= 0 ? filter.getPage() : 0;
        int size = filter.getSizePerPage() != null && filter.getSizePerPage() > 0 ? filter.getSizePerPage() : 20;

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(filter.getSortBy())) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(filter.getSortBy())) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("isActive"), true));

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String searchLike = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchLike);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchLike);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), searchLike);
                predicates.add(cb.or(nameMatch, descMatch, brandMatch));
            }

            if (filter.getCategory() != null && !filter.getCategory().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category").get("name")), filter.getCategory().trim().toLowerCase()));
            }

            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
            }

            if (filter.getGender() != null && !filter.getGender().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("gender")), filter.getGender().trim().toLowerCase()));
            }

            if (filter.getBrand() != null && !filter.getBrand().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), filter.getBrand().trim().toLowerCase()));
            }

            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }

            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            if (filter.getMaterial() != null && !filter.getMaterial().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("material")), filter.getMaterial().trim().toLowerCase()));
            }

            if (filter.getColor() != null && !filter.getColor().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("colors")), "%" + filter.getColor().trim().toLowerCase() + "%"));
            }

            if (filter.getSize() != null && !filter.getSize().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("sizes")), "%" + filter.getSize().trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found with ID: " + id, 404));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new ApiException("SKU already exists: " + request.getSku(), 409);
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException("Category not found with ID: " + request.getCategoryId(), 404));
        }

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .brand(request.getBrand())
                .material(request.getMaterial())
                .category(category)
                .gender(request.getGender())
                .sizes(request.getSizes() != null ? String.join(",", request.getSizes()) : null)
                .colors(request.getColors() != null ? String.join(",", request.getColors()) : null)
                .isFeatured(request.isFeatured())
                .isActive(true)
                .build();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(ProductImage.builder()
                        .product(product)
                        .url(request.getImageUrls().get(i))
                        .isPrimary(i == 0)
                        .displayOrder(i)
                        .build());
            }
            product.setImages(images);
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found with ID: " + id, 404));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null) product.setOriginalPrice(request.getOriginalPrice());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getMaterial() != null) product.setMaterial(request.getMaterial());
        if (request.getGender() != null) product.setGender(request.getGender());
        if (request.getSizes() != null) product.setSizes(String.join(",", request.getSizes()));
        if (request.getColors() != null) product.setColors(String.join(",", request.getColors()));
        if (request.getIsFeatured() != null) product.setFeatured(request.getIsFeatured());
        if (request.getIsActive() != null) product.setActive(request.getIsActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException("Category not found with ID: " + request.getCategoryId(), 404));
            product.setCategory(category);
        }

        if (request.getImageUrls() != null) {
            product.getImages().clear();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                product.getImages().add(ProductImage.builder()
                        .product(product)
                        .url(request.getImageUrls().get(i))
                        .isPrimary(i == 0)
                        .displayOrder(i)
                        .build());
            }
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found with ID: " + id, 404));
        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {
        List<String> sizesList = product.getSizes() != null && !product.getSizes().isBlank()
                ? Arrays.asList(product.getSizes().split(","))
                : Collections.emptyList();

        List<String> colorsList = product.getColors() != null && !product.getColors().isBlank()
                ? Arrays.asList(product.getColors().split(","))
                : Collections.emptyList();

        List<ProductImageDto> imageDtos = product.getImages() != null ? product.getImages().stream()
                .map(img -> ProductImageDto.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .isPrimary(img.isPrimary())
                        .displayOrder(img.getDisplayOrder())
                        .build())
                .collect(Collectors.toList()) : Collections.emptyList();

        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .brand(product.getBrand())
                .material(product.getMaterial())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .gender(product.getGender())
                .sizes(sizesList)
                .colors(colorsList)
                .isFeatured(product.isFeatured())
                .isActive(product.isActive())
                .images(imageDtos)
                .build();
    }
}
