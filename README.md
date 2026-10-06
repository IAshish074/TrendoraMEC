# 🛍️ Trendora — Distributed E-Commerce Web Application

Trendora is a modern, scalable and distributed e-commerce web application developed using **React.js, Spring Boot Microservices, PostgreSQL, RabbitMQ and Docker**.

The project follows a **microservices architecture** in which major business functionalities such as authentication, user management, product management, cart, orders, inventory and payments are implemented as independent services.

The application uses an **API Gateway** as the single entry point for frontend requests and **RabbitMQ** for asynchronous, event-driven communication between services.

---

## 📌 Project Overview

The main objective of Trendora is to develop a complete e-commerce platform using modern full-stack and distributed-system technologies.

The system provides:

- User registration and login
- JWT-based authentication
- Role-based authorization
- User and Admin dashboards
- Product browsing and management
- Shopping cart management
- Order processing
- Inventory management
- Payment processing
- Event-driven communication
- PostgreSQL database persistence
- RESTful APIs
- API Gateway routing
- Docker-based deployment
- Application health monitoring

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      React.js        │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     API Gateway      │
                         │       :8080          │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │Auth Service │       │User Service │       │Product      │
      │    :8081    │       │    :8082    │       │Service :8083│
      └─────────────┘       └─────────────┘       └─────────────┘
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │Cart Service │       │Order Service│       │Inventory    │
      │    :8084    │       │    :8085    │       │Service :8086 │
      └─────────────┘       └─────────────┘       └─────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │Payment Service│
                            │    :8087      │
                            └───────────────┘

                    ┌────────────────────────┐
                    │ PostgreSQL / Supabase  │
                    └────────────────────────┘

                    ┌────────────────────────┐
                    │        RabbitMQ         │
                    │   Event Communication   │
                    └────────────────────────┘




✨ Key Features
🔐 Authentication & Authorization
Trendora provides secure authentication and authorization using JWT.
Features include:
- User registration
- User login
- JWT access tokens
- Refresh tokens
- RSA 2048-bit JWT signing
- Password hashing
- Role-based authorization
- Protected routes
- Protected backend APIs
- Authentication through API Gateway
- Automatic token validation
User Roles
The application supports two roles:
USER
ADMIN

Role	Permissions
USER	Browse products, manage cart, place orders, view orders and access user dashboard
ADMIN	Manage products, manage users, view statistics and access admin dashboard


New users are assigned the USER role by default.
👤 User Dashboard
Normal users can access a dedicated user dashboard.
User functionality includes:
- View account information
- Browse products
- View product details
- Add products to cart
- Update cart
- Remove products from cart
- Place orders
- View order history
- Track order information
User routes are protected and cannot be accessed without authentication.
👨‍💼 Admin Dashboard
Administrators have access to a dedicated admin dashboard.
Admin functionality includes:
- Product management
- Add new products
- Update products
- Delete products
- Product image management
- User management
- View users
- Manage user roles
- View sales statistics
- View product statistics
- View revenue information
- View profit-related analytics
- Monitor order information
Admin APIs are protected using role-based authorization.
🛍️ Product Management
The product service manages all product-related operations.
Users can:
- Browse products
- Search products
- View product details
- Browse product categories
- Add products to cart
Admins can:
- Create products
- Update products
- Delete products
- Manage product details
- Manage product images
- Manage product information
🛒 Shopping Cart
The Cart Service manages user shopping carts.
Features include:
- Add product to cart
- Remove product from cart
- Update product quantity
- Retrieve cart
- Calculate cart totals
- User-specific cart management
📦 Order Management
The Order Service manages the complete order lifecycle.
Features include:
- Create orders
- Process orders
- Store order information
- Manage order status
- Retrieve order history
- Order confirmation
- Integration with inventory
- Integration with payment service
📊 Inventory Management
The Inventory Service manages product stock.
Features include:
- Stock management
- Stock availability checking
- Inventory reservation
- Inventory updates
- Inventory validation
- Inventory-related events
💳 Payment Integration
The application integrates with the PayPal Sandbox API for payment processing.
Payment functionality includes:
- Payment creation
- Payment processing
- Payment verification
- Payment completion
- Payment failure handling
- Order-payment integration
The application uses the PayPal Sandbox environment for development and testing.
📨 RabbitMQ Event-Driven Architecture
RabbitMQ is used for asynchronous communication between microservices.
This reduces direct dependency between services and enables event-driven processing.
Example Order Flow
User places order
       │
       ▼
Order Service
       │
       ▼
order.created
       │
       ▼
RabbitMQ Exchange
       │
       ├──────────────► Inventory Service
       │
       ├──────────────► Payment Service
       │
       └──────────────► Notification Service

Example events include:
order.created
inventory.reserved
inventory.rejected
payment.completed
payment.failed
user.registered
order.confirmed

🧩 Microservices
The backend is divided into independent Spring Boot microservices.
Service	Port	Responsibility
API Gateway	8080	Central entry point and request routing
Auth Service	8081	Authentication, JWT and authorization
User Service	8082	User management
Product Service	8083	Product management
Cart Service	8084	Shopping cart
Order Service	8085	Order processing
Inventory Service	8086	Inventory and stock
Payment Service	8087	Payment processing


🔐 Security Architecture
The application uses JWT-based authentication with RSA 2048-bit keys.
                    Login Request
                         │
                         ▼
                  ┌─────────────┐
                  │Auth Service │
                  └──────┬──────┘
                         │
                  Validate User
                         │
                         ▼
                    Generate JWT
                         │
                         ▼
                     Frontend
                         │
                         ▼
              Authorization Header
               Bearer <JWT Token>
                         │
                         ▼
                  API Gateway
                         │
                         ▼
                Protected Service

JWT configuration uses:
- RSA 2048-bit private key
- RSA 2048-bit public key
- Access token
- Refresh token
- Token expiration
- JWT issuer
- Role claims
The private key is used for signing JWTs, while the public key is used for validation.
🗄️ Database
The project uses PostgreSQL for persistent data storage.
Supabase PostgreSQL can be used as the hosted database environment.
The system stores information related to:
- Users
- Roles
- Products
- Cart
- Orders
- Inventory
- Payments
The backend uses:
- Spring Data JPA
- Hibernate
- PostgreSQL
- JPA Entities
- Repository Pattern
🛠️ Technology Stack
Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Tailwind CSS
- Vite
- Axios
- React Router
Backend
- Java 17
- Spring Boot 3.3.x
- Spring Cloud Gateway
- Spring Data JPA
- Hibernate
- Spring Security
- JWT
- REST APIs
Database
- PostgreSQL
- Supabase
- JPA
- Hibernate
Messaging
- RabbitMQ
- CloudAMQP
Payment
- PayPal Sandbox
DevOps
- Docker
- Docker Compose
- Git
- GitHub
Monitoring
- Spring Boot Actuator
📁 Project Structure
meccomerce/
│
├── api-gateway/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── auth-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── user-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── product-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── cart-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── order-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── inventory-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── payment-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── infrastructure/
│   └── postgres/
│       └── init.sql
│
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md

⚙️ Prerequisites
Install the following before running the project:
- Java 17 or higher
- Maven
- Node.js 18 or higher
- npm
- Docker
- Docker Compose
- PostgreSQL / Supabase
- RabbitMQ / CloudAMQP
- PayPal Developer Account
Verify installations:
java -version

mvn -version

node -v

npm -v

docker --version

🔧 Environment Configuration
Create a .env file in the project root.
Use environment variables for all sensitive configuration.
Example:
SPRING_PROFILES_ACTIVE=docker

# PostgreSQL
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=6543
POSTGRES_ADMIN_USER=your-user
POSTGRES_ADMIN_PASSWORD=your-password
POSTGRES_SSL_MODE=require

AUTH_DB_NAME=postgres
USER_DB_NAME=postgres
PRODUCT_DB_NAME=postgres
CART_DB_NAME=postgres
ORDER_DB_NAME=postgres
INVENTORY_DB_NAME=postgres
PAYMENT_DB_NAME=postgres

# Microservice Ports
GATEWAY_PORT=8080
AUTH_SERVICE_PORT=8081
USER_SERVICE_PORT=8082
PRODUCT_SERVICE_PORT=8083
CART_SERVICE_PORT=8084
ORDER_SERVICE_PORT=8085
INVENTORY_SERVICE_PORT=8086
PAYMENT_SERVICE_PORT=8087

# RabbitMQ
RABBITMQ_HOST=your-rabbitmq-host
RABBITMQ_PORT=5671
RABBITMQ_USER=your-user
RABBITMQ_PASSWORD=your-password
RABBITMQ_VHOST=your-vhost
RABBITMQ_SSL_ENABLED=true
RABBITMQ_EXCHANGE=ecommerce.events

# JWT
JWT_ISSUER=trendora-auth
JWT_ACCESS_TOKEN_MINUTES=15
JWT_REFRESH_TOKEN_DAYS=7
JWT_PRIVATE_KEY_BASE64=your-private-key
JWT_PUBLIC_KEY_BASE64=your-public-key

# PayPal
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret

# Mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Microservice URLs
AUTH_SERVICE_URL=http://127.0.0.1:8081
USER_SERVICE_URL=http://127.0.0.1:8082
PRODUCT_SERVICE_URL=http://127.0.0.1:8083
CART_SERVICE_URL=http://127.0.0.1:8084
ORDER_SERVICE_URL=http://127.0.0.1:8085
INVENTORY_SERVICE_URL=http://127.0.0.1:8086
PAYMENT_SERVICE_URL=http://127.0.0.1:8087

Important: Never commit real passwords, API keys, JWT private keys, database credentials or other secrets to GitHub.

🚀 Running the Project with Docker
Build and start all services:
docker compose up --build

Run in detached mode:
docker compose up --build -d

Check running containers:
docker compose ps

View logs:
docker compose logs -f

View logs for a specific service:
docker compose logs -f auth-service

Stop all services:
docker compose down

💻 Running Backend Locally
The services can also be started individually during development.
Auth Service
./mvnw -pl auth-service spring-boot:run

User Service
./mvnw -pl user-service spring-boot:run

Product Service
./mvnw -pl product-service spring-boot:run

Cart Service
./mvnw -pl cart-service spring-boot:run

Order Service
./mvnw -pl order-service spring-boot:run

Inventory Service
./mvnw -pl inventory-service spring-boot:run

Payment Service
./mvnw -pl payment-service spring-boot:run

API Gateway
./mvnw -pl api-gateway spring-boot:run

The API Gateway runs on:
http://localhost:8080

🌐 Running the Frontend
Navigate to the frontend directory:
cd frontend

Install dependencies:
npm install

Start the development server:
npm run dev

The frontend will normally be available at:
http://localhost:5173

🔄 Application Workflows
User Registration
React Frontend
      │
      ▼
API Gateway
      │
      ▼
Auth Service
      │
      ▼
Validate Registration
      │
      ▼
PostgreSQL
      │
      ▼
User Created

User Login
React Frontend
      │
      ▼
API Gateway
      │
      ▼
Auth Service
      │
      ▼
Validate Credentials
      │
      ▼
Generate JWT
      │
      ▼
Return Authentication Response
      │
      ▼
Frontend
      │
      ▼
USER Dashboard / ADMIN Dashboard

Product Purchase
User
 │
 ▼
Product
 │
 ▼
Add to Cart
 │
 ▼
Checkout
 │
 ▼
Order Service
 │
 ▼
RabbitMQ
 │
 ├──────────────► Inventory Service
 │
 └──────────────► Payment Service
                       │
                       ▼
                 Payment Result
                       │
                       ▼
                 Order Status

🌐 API Gateway
The API Gateway acts as the centralized entry point for the frontend.
Typical routes include:
/api/auth/**
/api/users/**
/api/products/**
/api/cart/**
/api/orders/**
/api/inventory/**
/api/payments/**

The Gateway forwards requests to the appropriate microservice.
For local development:
API Gateway       → http://127.0.0.1:8080
Auth Service      → http://127.0.0.1:8081
User Service      → http://127.0.0.1:8082
Product Service   → http://127.0.0.1:8083
Cart Service      → http://127.0.0.1:8084
Order Service     → http://127.0.0.1:8085
Inventory Service → http://127.0.0.1:8086
Payment Service   → http://127.0.0.1:8087

🧪 Testing
The application can be tested at multiple levels.
Authentication Testing
- Valid registration
- Valid login
- Invalid login credentials
- JWT validation
- Expired JWT
- Invalid JWT
- Unauthorized requests
- User accessing admin endpoints
- Admin accessing admin endpoints
- Protected route validation
Product Testing
- Create product
- Retrieve products
- Retrieve product details
- Update product
- Delete product
- Product validation
Cart Testing
- Add product
- Remove product
- Update quantity
- Retrieve cart
- Calculate cart total
Order Testing
- Create order
- Validate inventory
- Process payment
- Update order status
- Retrieve order history
Payment Testing
- Create payment
- Complete payment
- Failed payment
- Payment verification
API Testing
APIs can be tested using:
- Postman
- Browser Developer Tools
- REST clients
❤️ Health Monitoring
Spring Boot Actuator is used to monitor service health.
Example endpoint:
http://localhost:8080/actuator/health

Individual services can expose their own Actuator health endpoints depending on configuration.
🔒 Security Best Practices
The application follows several security practices:
- JWT-based authentication
- RSA 2048-bit token signing
- Role-based authorization
- Password hashing
- Protected backend endpoints
- Protected frontend routes
- Environment-based configuration
- CORS configuration
- Secure external service credentials
- No sensitive credentials committed to source control
📈 Scalability
The microservices architecture allows individual services to be scaled independently.
For example, if Product Service receives high traffic, multiple instances can be deployed:
              Product Requests
                     │
                     ▼
              Load Balancer
               /     |     \
              /      |      \
             ▼       ▼       ▼
        Product   Product   Product
        Instance  Instance  Instance
           1         2         3

This allows high-traffic services to scale independently without scaling the complete application.
🐳 Docker Architecture
Docker is used to containerize the application services.
┌────────────────────────────────────────────┐
│                Docker Network              │
│                                            │
│  ┌──────────────┐                          │
│  │ API Gateway  │                          │
│  └──────────────┘                          │
│          │                                 │
│  ┌───────┼────────┬────────┬──────────┐   │
│  │       │        │        │          │   │
│ Auth   User    Product    Cart      Order │
│  │       │        │        │          │   │
│  └───────┴────────┴────────┴──────────┘   │
│                                            │
│  Inventory        Payment                  │
│                                            │
│  PostgreSQL       RabbitMQ                 │
│                                            │
└────────────────────────────────────────────┘

Docker Compose is used to manage the multi-container application.
🔄 Development Workflow
1. Clone Repository
        │
        ▼
2. Configure Environment Variables
        │
        ▼
3. Configure PostgreSQL
        │
        ▼
4. Configure RabbitMQ
        │
        ▼
5. Start Backend Services
        │
        ▼
6. Start API Gateway
        │
        ▼
7. Start React Frontend
        │
        ▼
8. Test Authentication
        │
        ▼
9. Test Products and Cart
        │
        ▼
10. Test Orders and Payments
        │
        ▼
11. Test Complete E-Commerce Flow

🛣️ Future Enhancements
The project can be extended with:
- Advanced product search
- Product recommendation system
- Wishlist
- Coupons and discount management
- Order tracking
- Email notifications
- Redis caching
- Elasticsearch
- Distributed tracing
- Centralized logging
- CI/CD pipeline
- Kubernetes deployment
- Cloud deployment
- Advanced business analytics
- Multi-vendor marketplace
- Customer reviews and ratings
📚 Learning Outcomes
This project provides practical experience in:
- Full-stack web development
- React.js development
- Java and Spring Boot
- Microservices architecture
- REST API development
- API Gateway implementation
- JWT authentication
- Role-based authorization
- PostgreSQL database management
- JPA and Hibernate
- RabbitMQ messaging
- Event-driven architecture
- Docker containerization
- Payment gateway integration
- API testing
- Application monitoring
- Distributed system design
👨‍💻 Author
Ashish Kumar Mishra
Bachelor of Engineering — Computer Science & Engineering
Chitkara University, Himachal Pradesh
Project
Trendora — Distributed E-Commerce Web Application
Core Technologies
React.js
Java
Spring Boot
Spring Cloud Gateway
PostgreSQL
Supabase
RabbitMQ
CloudAMQP
Docker
JWT
PayPal