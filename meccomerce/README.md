# Trendora Microservice Backend Monorepo

Production-grade Spring Boot microservices backend for Trendora E-Commerce.

## System Services & Ports
| Service | Port | Database | Responsibilities |
|---------|------|----------|------------------|
| **`api-gateway`** | 8080 | None | Routing `/api/*`, JWT verification, CORS, Rate limiting |
| **`auth-service`** | 8081 | `auth_db` | User identity, registration, login, RSA JWT signing, refresh tokens |
| **`user-service`** | 8082 | `user_db` | Profile information, shipping addresses, admin role updates |
| **`product-service`** | 8083 | `product_db` | Catalog, categories, search, filtering, brand/material attributes |
| **`cart-service`** | 8084 | `cart_db` | Shopping cart items and quantities |
| **`order-service`** | 8085 | `order_db` | Order creation, historical price snapshotting, state machine |
| **`inventory-service`** | 8086 | `inventory_db` | Stock availability, reservation Saga orchestration |
| **`payment-service`** | 8087 | `payment_db` | Payment initialization, PayPal verification, refunds |

## Infrastructure
- **PostgreSQL** (`5432`): Isolated databases for each service.
- **RabbitMQ** (`5672` / UI `15672`): Asynchronous event streaming & emails.

## Running Locally
```bash
# Build all Maven modules
./mvnw clean install -DskipTests

# Start complete stack with Docker Compose
docker compose up --build
```
