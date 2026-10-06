# Trendora Database Design

Each microservice owns its isolated database schema in PostgreSQL.

## 1. Auth Service (`auth_db`)
- `users`: `id`, `name`, `email`, `password_hash`, `enabled`, `created_at`
- `roles`: `id`, `name` (`ROLE_USER`, `ROLE_ADMIN`)
- `user_roles`: `user_id`, `role_id`
- `refresh_tokens`: `id`, `user_id`, `token_hash`, `expiry_date`, `revoked`
- `outbox_events`: `id`, `event_id`, `event_type`, `payload`, `status`, `created_at`

## 2. User Service (`user_db`)
- `user_profiles`: `id`, `user_id`, `name`, `email`, `phone`, `created_at`
- `addresses`: `id`, `user_profile_id`, `first_name`, `last_name`, `address_line`, `city`, `postal_code`, `country`, `phone`, `is_default`

## 3. Product Service (`product_db`)
- `products`: `id`, `name`, `description`, `price`, `original_price`, `sku`, `brand`, `material`, `gender`, `category_id`, `created_at`
- `categories`: `id`, `name`, `slug`
- `product_images`: `id`, `product_id`, `url`, `alt_text`
- `product_attributes`: `id`, `product_id`, `attribute_type` (COLOR/SIZE), `attribute_value`

## 4. Cart Service (`cart_db`)
- `carts`: `id`, `user_id`, `updated_at`
- `cart_items`: `id`, `cart_id`, `product_id`, `name`, `price`, `quantity`, `size`, `color`, `image`

## 5. Order Service (`order_db`)
- `orders`: `id`, `user_id`, `user_name`, `user_email`, `total_price`, `status`, `payment_status`, `payment_method`, `created_at`, `updated_at`
- `order_items`: `id`, `order_id`, `product_id`, `name`, `price`, `quantity`, `size`, `color`, `image`
- `shipping_addresses`: `id`, `order_id`, `first_name`, `last_name`, `address`, `city`, `postal_code`, `country`, `phone`

## 6. Inventory Service (`inventory_db`)
- `inventory_items`: `id`, `product_id`, `available_quantity`, `reserved_quantity`
- `stock_reservations`: `id`, `order_id`, `product_id`, `quantity`, `status`

## 7. Payment Service (`payment_db`)
- `payments`: `id`, `order_id`, `user_id`, `amount`, `currency`, `provider`, `status`, `created_at`
- `payment_transactions`: `id`, `payment_id`, `provider_transaction_id`, `status`, `raw_response`
- `refunds`: `id`, `payment_id`, `amount`, `status`, `reason`, `created_at`
