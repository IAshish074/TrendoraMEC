# AWS Deployment Guide - Single Container Trendora Deployment

This guide explains how to deploy the entire Trendora project (React Frontend + 8 Spring Boot Microservices + Nginx) packaged inside a single Docker container.

---

## 1. Container Architecture Overview

Within this single container:
- **Port 80 (Nginx)**: The single entry point exposed to the world.
  - Serves the compiled React + Vite + TailwindCSS static assets.
  - Handles client-side SPA routing (`try_files $uri /index.html`).
  - Reverse-proxies `/api/*` directly to `127.0.0.1:8080` (API Gateway).
  - Responds to `/health` with `200 OK` (for AWS ALB/ECS/App Runner health checks).
- **Port 8080 (API Gateway)**: Central entry point for backend microservices with RSA JWT verification.
- **Ports 8081-8087 (Microservices)**:
  - `auth-service` (8081)
  - `user-service` (8082)
  - `product-service` (8083)
  - `cart-service` (8084)
  - `order-service` (8085)
  - `inventory-service` (8086)
  - `payment-service` (8087)
- **Supervisor**: Manages process lifecycle, startup priority, autorestart, and logs all services directly to stdout/stderr.
- **Optimized Memory**: Each JVM is allocated `-Xms64m -Xmx160m` to ensure all 8 services run reliably inside a standard 2GB - 4GB instance without Out-of-Memory (OOM) crashes.

---

## 2. Pre-Deployment Checklist (Environment Variables)

Before deploying to AWS, make sure to check two items in `meccomerce/.env`:

1. **RabbitMQ CloudAMQP Password**:
   - Update line 46:
     ```env
     RABBITMQ_PASSWORD=your_actual_cloudamqp_password
     ```
2. **Supabase PostgreSQL Connection**:
   - Supabase requires SSL:
     ```env
     POSTGRES_SSL_MODE=require
     ```
   - If Supabase returns `tenant/user ... not found`, open your [Supabase Dashboard](https://supabase.com/dashboard) and verify that your project is **Active** (click "Restore / Resume project" if it was paused).

---

## 3. How to Build the Docker Image

### Option A: Fast Build (Recommended - uses pre-compiled artifacts)
```bash
docker build -f Dockerfile.fast -t trendora:latest .
```

### Option B: Full Multi-Stage Build (Builds frontend & backend from scratch inside Docker)
```bash
docker build -t trendora:latest .
```

---

## 4. Deploying to AWS EC2 (Easiest & Most Flexible)

### Step 1: Launch EC2 Instance
- **AMI**: Ubuntu 22.04 or 24.04 LTS
- **Instance Type**: `t3.small` (2 GB RAM) or `t3.medium` (4 GB RAM - recommended)
- **Security Group Inbound Rules**:
  - Port `80` (HTTP) -> `0.0.0.0/0`
  - Port `443` (HTTPS) -> `0.0.0.0/0` (if using SSL)
  - Port `22` (SSH) -> `My IP`

### Step 2: Install Docker on EC2
Connect via SSH and run:
```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
# Log out and log back in for group changes to take effect
```

### Step 3: Run the Container on EC2

#### Method 1: Using Docker Hub
1. On your local machine, tag and push the image:
   ```bash
   docker tag trendora:latest <your-dockerhub-username>/trendora:latest
   docker push <your-dockerhub-username>/trendora:latest
   ```
2. Copy your `.env` file to EC2:
   ```bash
   scp -i your-key.pem meccomerce/.env ubuntu@<ec2-public-ip>:~/trendora.env
   ```
3. On EC2, pull and run:
   ```bash
   docker run -d \
     --name trendora \
     --restart unless-stopped \
     -p 80:80 \
     --env-file ~/trendora.env \
     <your-dockerhub-username>/trendora:latest
   ```

#### Method 2: Direct Image Transfer (Without Docker Hub)
If you don't want to use a registry:
1. Save the image on your computer:
   ```bash
   docker save trendora:latest | gzip > trendora-image.tar.gz
   ```
2. Copy to EC2:
   ```bash
   scp -i your-key.pem trendora-image.tar.gz meccomerce/.env ubuntu@<ec2-public-ip>:~/
   ```
3. On EC2:
   ```bash
   docker load < trendora-image.tar.gz
   docker run -d --name trendora --restart unless-stopped -p 80:80 --env-file ~/meccomerce/.env trendora:latest
   ```

---

## 5. Deploying to AWS App Runner / Amazon ECS (Serverless)

### Step 1: Create Amazon ECR Repository
```bash
aws ecr create-repository --repository-name trendora --region ap-south-1
```

### Step 2: Authenticate and Push
```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com

docker tag trendora:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/trendora:latest
docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/trendora:latest
```

### Step 3: Create Service on App Runner or ECS Fargate
- **Port**: `80`
- **vCPU**: 2 vCPU
- **Memory**: 3 GB or 4 GB
- **Health Check Path**: `/health`
- **Environment Variables**: Add keys from `meccomerce/.env` directly in the AWS console.

---

## 6. Verification
Once deployed, open your browser and visit:
```text
http://<your-ec2-public-ip>/
```
- The frontend will load and communicate with `/api/*` endpoints through Nginx.
- Check container logs anytime:
  ```bash
  docker logs -f trendora
  ```
