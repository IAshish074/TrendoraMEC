package com.ashish.ecommerce.product.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.product.dto.CategoryResponse;
import com.ashish.ecommerce.product.dto.CreateCategoryRequest;
import com.ashish.ecommerce.product.entity.Category;
import com.ashish.ecommerce.product.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Category not found with ID: " + id, 404));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ApiException("Category name already exists: " + request.getName(), 409);
        }

        String slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ApiException("Parent category not found with ID: " + request.getParentId(), 404));
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .parent(parent)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Category not found with ID: " + id, 404));

        if (!category.getName().equalsIgnoreCase(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new ApiException("Category name already exists: " + request.getName(), 409);
        }

        category.setName(request.getName());
        category.setSlug(request.getName().toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-"));
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ApiException("Parent category not found", 404));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Category not found with ID: " + id, 404));
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .build();
    }
}
