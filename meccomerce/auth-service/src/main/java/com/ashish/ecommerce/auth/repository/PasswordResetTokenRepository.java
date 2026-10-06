package com.ashish.ecommerce.auth.repository;

import com.ashish.ecommerce.auth.entity.PasswordResetToken;
import com.ashish.ecommerce.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    void deleteByUser(User user);
}
