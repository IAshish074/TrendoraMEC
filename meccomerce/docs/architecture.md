# Trendora Microservice Architecture

## Overview
Trendora is a distributed e-commerce backend built with Java 17/21, Spring Boot 3.3.x, Spring Cloud Gateway, Spring Security with RSA JWT signing, PostgreSQL, and RabbitMQ event streaming.

```
                         ┌─────────────────────┐
                         │    TRENDORA REACT   │
                         └──────────┬──────────┘
                                    │
                               /api/*
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    API GATEWAY      │
                         │       :8080         │
                         │                     │
                         │ Routing             │
                         │ JWT validation      │
                         │ Authorization       │
                         │ CORS                │
                         └──────────┬──────────┘
                                    │
          ┌────────────┬────────────┼────────────┬────────────┐
          │            │            │            │            │
          ▼            ▼            ▼            ▼            ▼
       Auth :8081   User :8082  Product :8083  Cart :8084  Order :8085
          │            │            │            │            │
          ▼            ▼            ▼            ▼            │
       auth_db      user_db     product_db     cart_db        │
                                                               │
                                                               │
                                                               ▼
                                                        ┌─────────────┐
                                                        │  RabbitMQ   │
                                                        │    :5672    │
                                                        └──────┬──────┘
                                                               │
                                              ┌────────────────┼──────────────┐
                                              ▼                ▼              ▼
                                        Inventory :8086   Payment :8087    Email
                                              │                │
                                              ▼                ▼
                                        inventory_db      payment_db
                                                               │
                                                               ▼
                                                             PayPal
```

## Microservices Breakdown
1. **API Gateway (`api-gateway`)** - Port 8080. Route handling, JWT verification, CORS control, rate limiting.
2. **Auth Service (`auth-service`)** - Port 8081. User registration, login, password hashing, RSA JWT signing, refresh tokens.
3. **User Service (`user-service`)** - Port 8082. Customer profiles, addresses, role updates.
4. **Product Service (`product-service`)** - Port 8083. Product catalog, categories, search, filtering, brand/material attributes.
5. **Cart Service (`cart-service`)** - Port 8084. Customer cart items and quantity updates.
6. **Order Service (`order-service`)** - Port 8085. Order creation, item price snapshotting, order status state machine.
7. **Inventory Service (`inventory-service`)** - Port 8086. Available vs reserved stock tracking and Saga reservations.
8. **Payment Service (`payment-service`)** - Port 8087. Payment creation, server-side PayPal transaction verification, refunds.
