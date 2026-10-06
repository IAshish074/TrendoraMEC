package com.ashish.ecommerce.inventory.repository;

import com.ashish.ecommerce.inventory.entity.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {
    List<StockReservation> findByOrderId(Long orderId);
    List<StockReservation> findByOrderIdAndStatus(Long orderId, String status);
}
