===============================================================================
               TRENDORA CENTRALIZED API GATEWAY CORS CONFIGURATION
===============================================================================

Project Monorepo: /Users/ashishkumarmishra/Desktop/clg project/meccomerce
Module: api-gateway (Spring Cloud Gateway 2023.0.3 + Spring WebFlux)
Status: IMPLEMENTED & VERIFIED (BUILD SUCCESS)

===============================================================================
1. CENTRALIZED CORS ARCHITECTURE
===============================================================================

CORS is configured exclusively at the API Gateway level (api-gateway:8080).
Downstream microservices (auth-service, user-service, product-service,
cart-service, order-service, inventory-service, payment-service) contain 
ZERO duplicated CORS configurations or @CrossOrigin annotations.

The browser communicates strictly with the Gateway (http://localhost:8080/api/*).
The Gateway acts as the authoritative CORS boundary for all incoming requests.

===============================================================================
2. CORS CONFIGURATION DETAILS
===============================================================================

Class: com.ashish.ecommerce.gateway.config.GatewayCorsConfig
Bean Type: org.springframework.web.cors.reactive.CorsWebFilter

- Allowed Origins: Configured via environment variable CORS_ALLOWED_ORIGINS.
  * Environment Variable: CORS_ALLOWED_ORIGINS
  * Default (Local Dev): http://localhost:5173
  * Comma-Separated Support: http://localhost:5173,https://trendora.example.com
  * Implementation safely trims spaces and ignores empty items.
  * Wildcard "*" is NOT used.

- Allowed HTTP Methods:
  * GET, POST, PUT, DELETE, PATCH, OPTIONS

- Allowed Request Headers:
  * Authorization
  * Content-Type
  * Accept
  * Origin
  * X-Requested-With
  * X-Correlation-ID
  * Wildcard "*" is NOT used.

- Exposed Response Headers:
  * X-Correlation-ID (Allows frontend code to read correlation IDs for distributed tracing)

- Credentials Handling:
  * allowCredentials = false
  * Rationale: Authentication uses Bearer JWT tokens sent in the Authorization header.
    Tokens and refresh tokens are returned in JSON response bodies and stored in 
    localStorage by the frontend. Browser cookies are not used for auth. Setting 
    allowCredentials(false) follows strict security guidelines and avoids origin reflection risks.

- Preflight Cache (Max Age):
  * 3600 seconds (1 hour)

===============================================================================
3. OPTIONS PREFLIGHT HANDLING
===============================================================================

In JwtAuthenticationFilter (com.ashish.ecommerce.gateway.security.JwtAuthenticationFilter):
  ```java
  if (request.getMethod() == HttpMethod.OPTIONS) {
      return chain.filter(exchange);
  }
  ```
  HTTP OPTIONS preflight requests bypass JWT authentication checks, preventing 
  401 / 403 status codes before CorsWebFilter processes and returns the preflight headers.

===============================================================================
4. ENVIRONMENT VARIABLES
===============================================================================

File: .env & .env.example
Setting: CORS_ALLOWED_ORIGINS=http://localhost:5173

In application.yml (api-gateway):
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}

===============================================================================
5. BUILD & VERIFICATION
===============================================================================

Executed `./mvnw clean verify` across all 10 modules:

[INFO] Reactor Summary for trendora-backend 1.0.0-SNAPSHOT:
[INFO] 
[INFO] trendora-backend ................................... SUCCESS
[INFO] common-library ..................................... SUCCESS
[INFO] api-gateway ........................................ SUCCESS
[INFO] auth-service ....................................... SUCCESS
[INFO] user-service ....................................... SUCCESS
[INFO] product-service .................................... SUCCESS
[INFO] cart-service ....................................... SUCCESS
[INFO] order-service ....................................... SUCCESS
[INFO] inventory-service .................................. SUCCESS
[INFO] payment-service .................................... SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
