# =============================================================
# Stage 1: Build React Frontend
# =============================================================
FROM node:20-alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# =============================================================
# Stage 2: Build Spring Boot Microservices monorepo
# =============================================================
FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace/meccomerce

COPY meccomerce/ ./
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests

RUN set -eu; \
    mkdir -p /out; \
    for service in api-gateway auth-service user-service product-service cart-service order-service inventory-service payment-service; do \
      jar_file="$(find "$service/target" -maxdepth 1 -type f -name '*.jar' ! -name '*-sources.jar' ! -name '*-javadoc.jar' | head -n 1)"; \
      if [ -z "$jar_file" ]; then echo "Missing JAR: $service"; exit 1; fi; \
      cp "$jar_file" "/out/$service.jar"; \
    done

# =============================================================
# Stage 3: Runtime Single Container (Nginx + 8 Microservices)
# =============================================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx supervisor curl ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /etc/nginx/sites-enabled/* /etc/nginx/sites-available/*

# Copy backend JARs
COPY --from=backend-build /out/ /app/

# Copy frontend static build
COPY --from=frontend-build /frontend/dist/ /usr/share/nginx/html/

# Copy configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Single Entry Port: Port 80
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-n"]
