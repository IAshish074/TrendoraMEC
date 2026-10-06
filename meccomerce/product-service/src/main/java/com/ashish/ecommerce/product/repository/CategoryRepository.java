package com.ashish.ecommerce.product.repository;

import com.ashish.ecommerce.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
}
