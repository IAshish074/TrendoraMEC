package com.ashish.ecommerce.order.service;

import com.ashish.ecommerce.common.exception.ApiException;
import com.ashish.ecommerce.order.dto.*;
import com.ashish.ecommerce.order.entity.*;
import com.ashish.ecommerce.order.messaging.OrderEventPublisher;
import com.ashish.ecommerce.order.repository.OrderItemRepository;
import com.ashish.ecommerce.order.repository.OrderRepository;
import com.ashish.ecommerce.order.repository.OrderStatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final OrderEventPublisher eventPublisher;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        OrderStatusHistoryRepository statusHistoryRepository,
                        OrderEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ApiException("Order items cannot be empty", 400);
        }

        BigDecimal calculatedItemsTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        String orderNumber = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        BigDecimal tax = request.getTax() != null ? request.getTax() : BigDecimal.ZERO;

        ShippingAddressDto addr = request.getShippingAddress();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(userId)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingFee(shippingFee)
                .tax(tax)
                .recipientName(addr.getRecipientName())
                .phone(addr.getPhone())
                .street(addr.getStreet())
                .city(addr.getCity())
                .state(addr.getState())
                .zipCode(addr.getZipCode())
                .country(addr.getCountry())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD")
                .build();

        for (CreateOrderItemRequest itemReq : request.getItems()) {
            BigDecimal itemTotal = itemReq.getPriceAtPurchase().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            calculatedItemsTotal = calculatedItemsTotal.add(itemTotal);

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .productId(itemReq.getProductId())
                    .productName(itemReq.getProductName())
                    .productSku(itemReq.getProductSku())
                    .priceAtPurchase(itemReq.getPriceAtPurchase())
                    .quantity(itemReq.getQuantity())
                    .size(itemReq.getSize())
                    .color(itemReq.getColor())
                    .imageUrl(itemReq.getImageUrl())
                    .build());
        }

        BigDecimal totalAmount = calculatedItemsTotal.add(shippingFee).add(tax);
        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        statusHistoryRepository.save(OrderStatusHistory.builder()
                .order(savedOrder)
                .previousStatus(null)
                .newStatus(OrderStatus.PENDING)
                .changedBy("SYSTEM")
                .comment("Order placed")
                .build());

        // Publish ORDER_CREATED event
        eventPublisher.publishOrderCreated(savedOrder);

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found with ID: " + orderId, 404));

        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new ApiException("Access denied: You cannot view another user's order", 403);
        }

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToResponse(Order order) {
        ShippingAddressDto addressDto = ShippingAddressDto.builder()
                .recipientName(order.getRecipientName())
                .phone(order.getPhone())
                .street(order.getStreet())
                .city(order.getCity())
                .state(order.getState())
                .zipCode(order.getZipCode())
                .country(order.getCountry())
                .build();

        List<OrderItemResponse> itemDtos = order.getItems() != null ? order.getItems().stream()
                .map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .productSku(i.getProductSku())
                        .priceAtPurchase(i.getPriceAtPurchase())
                        .quantity(i.getQuantity())
                        .size(i.getSize())
                        .color(i.getColor())
                        .imageUrl(i.getImageUrl())
                        .build())
                .collect(Collectors.toList()) : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .totalAmount(order.getTotalAmount())
                .shippingFee(order.getShippingFee())
                .tax(order.getTax())
                .shippingAddress(addressDto)
                .paymentMethod(order.getPaymentMethod())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
