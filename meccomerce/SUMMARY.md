# TRENDORA Microservice Backend Implementation

## Executive Summary

The complete microservices backend for **TRENDORA** has been successfully established and implemented in `/Users/ashishkumarmishra/Desktop/clg project/meccomerce`.

The architecture follows strict microservice principles:
- **8 Independent Spring Boot Applications** + **1 Shared Common Library Module**
- **Single Entry Point**: `api-gateway` (Port 8080) with centralized RSA JWT validation & route-level authorization
- **Event-Driven Architecture**: Asynchronous inter-service communication powered by RabbitMQ topic exchange `ecommerce.events`
- **Database Isolation**: Dedicated PostgreSQL database per service (`auth_db`, `user_db`, `product_db`, `cart_db`, `order_db`, `inventory_db`, `payment_db`), managed via Flyway migrations. Zero cross-database queries or shared JPA entities.
- **Server-Side PayPal Verification**: PayPal secrets remain strictly server-side in `payment-service`.
- **Asynchronous Email Handling**: Asynchronous RabbitMQ email listeners (`OrderEmailConsumer`, `PaymentEmailConsumer`, `AuthEventPublisher`) embedded directly within business domain services—no redundant standalone Notification microservice.

---

## 1. Project Directory Structure

```
meccomerce/
├── pom.xml                                   # Parent POM (Java 17, Spring Boot 3.3.5, Spring Cloud 2023.0.3)
├── common-library/                           # Shared DTOs, EventEnvelopes, Exception handling
│   ├── pom.xml
│   └── src/main/java/com/ashish/ecommerce/common/
│       ├── dto/ (ApiResponse, EventEnvelope, ErrorDetail)
│       ├── exception/ (ApiException)
│       └── util/ (CorrelationUtils)
├── api-gateway/                              # Port 8080 - Spring Cloud Gateway, RSA JWT Validation, Security & CORS
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/ashish/ecommerce/gateway/
│       ├── config/ (GatewayRouteConfig, CorsConfig)
│       ├── filter/ (JwtAuthenticationFilter, RequestCorrelationFilter)
│       ├── security/ (JwtUtils)
│       └── exception/ (GlobalGatewayExceptionHandler)
├── auth-service/                             # Port 8081 - DB: auth_db (BCrypt, RSA JWT, Refresh Tokens, Reset Token)
├── user-service/                             # Port 8082 - DB: user_db (User profiles, Shipping/Billing addresses)
├── product-service/                          # Port 8083 - DB: product_db (Products, Categories, Images, Filtering/Search)
├── cart-service/                             # Port 8084 - DB: cart_db (Active Shopping Cart & Cart items per user)
├── order-service/                            # Port 8085 - DB: order_db (Order lifecycle, Price snapshotting, Saga orchestration)
├── inventory-service/                        # Port 8086 - DB: inventory_db (Stock management & Reservation Saga)
├── payment-service/                          # Port 8087 - DB: payment_db (Server-side PayPal verification, Refunds)
├── infrastructure/
│   ├── postgres/init.sql                     # Automatic creation of 7 logical PostgreSQL databases
│   └── rabbitmq/definitions.json             # Exchanges, DLQs, Queues, and Topic Bindings
├── docs/                                     # System documentation
│   ├── architecture.md
│   ├── api-contract.md
│   ├── event-contract.md
│   ├── database-design.md
│   └── deployment.md
├── docker-compose.yml                        # Docker Compose configuration for 8 services + Postgres + RabbitMQ
├── .env                                      # Local environment configuration with pre-generated RSA 2048 keys
├── .env.example                              # Environment template for deployment environments
└── README.md                                 # Complete developer documentation
```

---

## 2. Microservice Architecture & Port Allocations

| Service | Port | Database | Responsibilities |
| :--- | :--- | :--- | :--- |
| **api-gateway** | `8080` | None | Single entry point, JWT verification, Routing, CORS, Correlation IDs |
| **auth-service** | `8081` | `auth_db` | Registration, Authentication, Password Hashing, RSA JWT Generation, Refresh Tokens |
| **user-service** | `8082` | `user_db` | User profile management, Address book, Admin user management |
| **product-service**| `8083` | `product_db` | Product catalog, Categories, Image links, Searching, Filtering & Sorting |
| **cart-service** | `8084` | `cart_db` | Active user cart, Cart items, Quantity & Variant updates |
| **order-service** | `8085` | `order_db` | Order creation, Price snapshotting, State machine, Order Saga orchestration |
| **inventory-service**|`8086` | `inventory_db` | Available & reserved stock, Reservation Saga listener, Stock adjustments |
| **payment-service**| `8087` | `payment_db` | PayPal server-side verification, Payment transactions, Admin refunds |
| **PostgreSQL** | `5432` | Shared instance | Isolated databases: `auth_db`, `user_db`, `product_db`, `cart_db`, `order_db`, `inventory_db`, `payment_db` |
| **RabbitMQ** | `5672` / `15672` | AMQP Exchange | Topic Exchange: `ecommerce.events` with DLQ retries |

---

## 3. Technology Stack & Dependencies

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Language** | Java 17 | JDK 17 with modern features |
| **Framework** | Spring Boot 3.3.5 | Production-ready microservice foundation |
| **Cloud Routing** | Spring Cloud Gateway 2023.0.3 | Non-blocking Reactive Gateway |
| **Security & JWT** | Spring Security + JJWT 0.12.6 | Asymmetric RSA 2048-bit token signing & verification |
| **Database** | PostgreSQL 15+ | Relational database per service |
| **Migrations** | Flyway 10.17.0 | Schema migration scripts in `classpath:db/migration` |
| **Messaging** | RabbitMQ + Spring AMQP | Asynchronous event publishing and DLQ consumers |
| **Documentation** | OpenAPI 3.0 (Springdoc 2.6.0) | Interactive Swagger UI endpoints per microservice |

---

## 4. Key Workflows & Event Processing

### 4.1 Order Creation & Inventory Saga Flow
1. **HTTP Checkout Request**: React Frontend calls `POST /api/orders` on `api-gateway`.
2. **Gateway**: Verifies JWT, injects `X-User-Id`, `X-User-Email`, `X-User-Roles`, forwards to `order-service`.
3. **Order Service**: Creates snapshot of purchased product prices, sets status `PENDING`, saves to `order_db`, and publishes `ORDER_CREATED` event to `ecommerce.events` (routing key `order.created`).
4. **Inventory Service**: Listens on `inventory.order-created.queue`. Verifies stock availability:
   - If stock available: deducts available quantity, increases reserved quantity, creates `StockReservation`, publishes `INVENTORY_RESERVED` (`inventory.reserved`).
   - If stock insufficient: publishes `INVENTORY_REJECTED` (`inventory.rejected`).
5. **Order Service**: Listens on `order.inventory-reserved.queue` and `order.inventory-rejected.queue`:
   - Updates order status to `PAYMENT_PENDING` (or `CANCELLED` if rejected).

### 4.2 Payment Verification & Order Confirmation Flow
1. **React Frontend**: Calls `POST /api/payments/create` via Gateway to obtain PayPal order ID.
2. **React Frontend**: User approves payment on PayPal; Frontend calls `POST /api/payments/verify`.
3. **Payment Service**: Performs server-side verification with PayPal REST API. Updates payment status to `PAID`, publishes `PAYMENT_COMPLETED` (`payment.completed`).
4. **Order Service**: Listens on `order.payment-completed.queue`. Updates payment status to `PAID`, order status to `CONFIRMED`, publishes `ORDER_CONFIRMED` (`order.confirmed`).
5. **Asynchronous Email Consumer**: `OrderEmailConsumer` in `order-service` receives `ORDER_CONFIRMED` and sends HTML order confirmation email.

---

## 5. Build & Verification Results

### Monorepo Build Execution
Executed `./mvnw clean compile` across all 10 modules:

```text
[INFO] Reactor Summary for trendora-backend 1.0.0-SNAPSHOT:
[INFO] 
[INFO] trendora-backend ................................... SUCCESS [  0.134 s]
[INFO] common-library ..................................... SUCCESS [  1.265 s]
[INFO] api-gateway ........................................ SUCCESS [  0.941 s]
[INFO] auth-service ....................................... SUCCESS [  0.963 s]
[INFO] user-service ....................................... SUCCESS [  0.648 s]
[INFO] product-service .................................... SUCCESS [  0.729 s]
[INFO] cart-service ....................................... SUCCESS [  0.627 s]
[INFO] order-service ...................................... SUCCESS [  0.742 s]
[INFO] inventory-service .................................. SUCCESS [  0.642 s]
[INFO] payment-service .................................... SUCCESS [  0.785 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Docker Startup Verification
All services can be started locally via:
```bash
docker compose up --build
```
- Gateway Entry Point: `http://localhost:8080/api/*`
- RabbitMQ Management UI: `http://localhost:15672` (guest / guest)
- Actuator Liveness Checks: `http://localhost:<service_port>/actuator/health`

---

## 6. Security & Environment Variable Matrix

The root `.env` file centralizes configuration securely:
- `JWT_PRIVATE_KEY_BASE64` & `JWT_PUBLIC_KEY_BASE64`: RSA 2048-bit key pair.
- `POSTGRES_ADMIN_USER` & `POSTGRES_ADMIN_PASSWORD`: Database credentials.
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`: PayPal integration secrets.
- `CORS_ALLOWED_ORIGINS`: Configured for frontend (`http://localhost:5173`).
