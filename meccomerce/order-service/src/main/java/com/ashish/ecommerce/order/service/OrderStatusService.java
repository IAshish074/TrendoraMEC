package com.ashish.ecommerce.order.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.order.dto.OrderResponse;
import com.ashish.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.ashish.ecommerce.order.entity.Order;
import com.ashish.ecommerce.order.entity.OrderStatus;
import com.ashish.ecommerce.order.entity.OrderStatusHistory;
import com.ashish.ecommerce.order.messaging.OrderEventPublisher;
import com.ashish.ecommerce.order.repository.OrderRepository;
import com.ashish.ecommerce.order.repository.OrderStatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderStatusService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final OrderEventPublisher eventPublisher;
    private final OrderService orderService;

    public OrderStatusService(OrderRepository orderRepository,
                              OrderStatusHistoryRepository statusHistoryRepository,
                              OrderEventPublisher eventPublisher,
                              OrderService orderService) {
        this.orderRepository = orderRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.eventPublisher = eventPublisher;
        this.orderService = orderService;
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, String changedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found with ID: " + orderId, 404));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            return orderService.getOrderById(orderId, null, true);
        }

        validateStateTransition(currentStatus, newStatus);

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        statusHistoryRepository.save(OrderStatusHistory.builder()
                .order(savedOrder)
                .previousStatus(currentStatus)
                .newStatus(newStatus)
                .changedBy(changedBy != null ? changedBy : "ADMIN")
                .comment(request.getComment())
                .build());

        if (newStatus == OrderStatus.CONFIRMED) {
            eventPublisher.publishOrderConfirmed(savedOrder);
        } else if (newStatus == OrderStatus.CANCELLED) {
            eventPublisher.publishOrderCancelled(savedOrder);
        } else if (newStatus == OrderStatus.SHIPPED) {
            eventPublisher.publishOrderShipped(savedOrder);
        } else if (newStatus == OrderStatus.DELIVERED) {
            eventPublisher.publishOrderDelivered(savedOrder);
        }

        return orderService.getOrderById(orderId, null, true);
    }

    private void validateStateTransition(OrderStatus current, OrderStatus next) {
        if (current == OrderStatus.CANCELLED || current == OrderStatus.DELIVERED) {
            throw new ApiException("Cannot change status of a terminal order (" + current + ")", 400);
        }

        if (next == OrderStatus.CANCELLED) {
            return; // Can cancel non-terminal orders
        }

        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.PAYMENT_PENDING || next == OrderStatus.CONFIRMED;
            case PAYMENT_PENDING -> next == OrderStatus.CONFIRMED;
            case CONFIRMED -> next == OrderStatus.PROCESSING;
            case PROCESSING -> next == OrderStatus.SHIPPED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            default -> false;
        };

        if (!valid) {
            throw new ApiException("Invalid status transition from " + current + " to " + next, 400);
        }
    }
}
