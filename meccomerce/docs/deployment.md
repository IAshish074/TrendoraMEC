# Trendora Backend Deployment Guide

## Prerequisites
- Java 17 / 21
- Maven 3.9+
- Docker & Docker Compose

## Quickstart (Docker Compose)
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Build and start infrastructure & all 8 microservices:
   ```bash
   docker compose up --build
   ```
3. Verify Services:
   - **API Gateway**: http://localhost:8080
   - **RabbitMQ UI**: http://localhost:15672 (guest/guest)
   - **PostgreSQL**: localhost:5432
