# Trendora API Contract

All frontend requests route through the API Gateway at `http://localhost:8080/api/*`.

## Auth Endpoints (`/api/auth/*`)
- `POST /api/auth/register` - Register new customer account (`ROLE_USER`).
- `POST /api/auth/login` - Authenticate user, returns RSA-signed JWT token + User info.
- `POST /api/auth/refresh` - Refresh access token using refresh token.
- `POST /api/auth/logout` - Logout and invalidate session.

## User Endpoints (`/api/users/*`)
- `GET /api/users/profile` - Get authenticated user profile.
- `PUT /api/users/profile` - Update user profile information.
- `GET /api/users` - Admin: List all registered users.
- `PUT /api/users/{id}/role` - Admin: Change user role (`ROLE_USER` / `ROLE_ADMIN`).
- `DELETE /api/users/{id}` - Admin: Delete user account.

## Product Endpoints (`/api/products/*`)
- `GET /api/products` - Search, filter (category, gender, color, size, brand, minPrice, maxPrice) & sort products.
- `GET /api/products/{id}` - Get product details by ID.
- `POST /api/products` - Admin: Create new product.
- `PUT /api/products/{id}` - Admin: Update product details.
- `DELETE /api/products/{id}` - Admin: Delete product.

## Cart Endpoints (`/api/cart/*`)
- `GET /api/cart` - Fetch authenticated user's cart.
- `POST /api/cart/items` - Add item to cart.
- `PUT /api/cart/items/{itemId}` - Update item quantity.
- `DELETE /api/cart/items/{itemId}` - Remove item from cart.
- `DELETE /api/cart` - Clear cart.

## Order Endpoints (`/api/orders/*`)
- `POST /api/orders` - Place order (captures price snapshots).
- `GET /api/orders/my-orders` - List authenticated user's order history.
- `GET /api/orders/{id}` - Get order details by ID.
- `GET /api/orders` - Admin: List all customer orders.
- `PUT /api/orders/{id}/status` - Admin: Update order status (`PENDING`, `PAYMENT_PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

## Payment Endpoints (`/api/payments/*`)
- `POST /api/payments/create` - Initiate payment transaction.
- `POST /api/payments/verify` - Verify PayPal capture server-side.
- `POST /api/payments/refund` - Admin: Process refund.
