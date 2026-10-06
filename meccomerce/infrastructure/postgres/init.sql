-- PostgreSQL Initialization Script for Trendora Microservices
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE product_db;
CREATE DATABASE cart_db;
CREATE DATABASE order_db;
CREATE DATABASE inventory_db;
CREATE DATABASE payment_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE user_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE product_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE cart_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE order_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO postgres;
