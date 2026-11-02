#!/bin/sh
set -e

echo "=========================================================="
echo "    Starting Trendora Single-Container Application        "
echo "=========================================================="

# If an .env file is provided in /app/.env, load it into environment
if [ -f /app/.env ]; then
    echo "[Entrypoint] Sourcing environment variables from /app/.env..."
    set -a
    # Load env file ignoring commented lines and empty lines
    eval "$(grep -v '^#' /app/.env | grep -v '^$' | sed -e 's/=\(.*\)/="\1"/' | sed -e 's/""/"/g')"
    set +a
fi

# Sane defaults for single-container environment
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-docker}"
export CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS:-*}"
export AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://127.0.0.1:8081}"
export USER_SERVICE_URL="${USER_SERVICE_URL:-http://127.0.0.1:8082}"
export PRODUCT_SERVICE_URL="${PRODUCT_SERVICE_URL:-http://127.0.0.1:8083}"
export CART_SERVICE_URL="${CART_SERVICE_URL:-http://127.0.0.1:8084}"
export ORDER_SERVICE_URL="${ORDER_SERVICE_URL:-http://127.0.0.1:8085}"
export INVENTORY_SERVICE_URL="${INVENTORY_SERVICE_URL:-http://127.0.0.1:8086}"
export PAYMENT_SERVICE_URL="${PAYMENT_SERVICE_URL:-http://127.0.0.1:8087}"

echo "[Entrypoint] Active Profile : ${SPRING_PROFILES_ACTIVE}"
echo "[Entrypoint] Database Host  : ${POSTGRES_HOST:-not set}"
echo "[Entrypoint] RabbitMQ Host  : ${RABBITMQ_HOST:-not set}"
echo "[Entrypoint] Gateway Port   : 8080 (internal)"
echo "[Entrypoint] Nginx Port     : 80 (external entrypoint)"
echo "=========================================================="

exec "$@"
