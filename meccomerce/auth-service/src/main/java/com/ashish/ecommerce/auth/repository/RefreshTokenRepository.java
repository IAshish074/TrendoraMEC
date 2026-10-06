package com.ashish.ecommerce.auth.repository;

import com.ashish.ecommerce.auth.entity.RefreshToken;
import com.ashish.ecommerce.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    void deleteByUser(User user);

    @Modifying
    void deleteByUserId(Long userId);
}
