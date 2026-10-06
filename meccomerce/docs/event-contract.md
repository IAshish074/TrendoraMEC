# Trendora RabbitMQ Event Contract

## Event Exchange
- `ecommerce.events` (Topic Exchange)

## Standard Event Envelope (`EventEnvelope<T>`)
```json
{
  "eventId": "uuid-v4",
  "eventType": "ORDER_CREATED",
  "eventVersion": 1,
  "source": "order-service",
  "occurredAt": "2026-10-03T22:00:00",
  "correlationId": "uuid-v4",
  "payload": { ... }
}
```

## Published Events & Routing Keys
1. **`user.registered`** - Published by Auth Service on registration. Consumed by Email handler.
2. **`order.created`** - Published by Order Service on order placement. Consumed by Inventory Service.
3. **`inventory.reserved`** - Published by Inventory Service when stock reserved. Consumed by Order Service.
4. **`inventory.rejected`** - Published by Inventory Service when stock insufficient. Consumed by Order Service.
5. **`payment.completed`** - Published by Payment Service on PayPal capture verification. Consumed by Order Service & Email handler.
6. **`payment.failed`** - Published by Payment Service on payment decline. Consumed by Order Service & Email handler.
7. **`order.confirmed`** - Published by Order Service when payment verified. Consumed by Email handler.
8. **`order.cancelled`** - Published by Order Service on cancellation. Consumed by Inventory Service to release stock & Email handler.
9. **`order.shipped`** - Published by Order Service when shipped. Consumed by Email handler.
10. **`order.delivered`** - Published by Order Service when delivered. Consumed by Email handler.
11. **`refund.completed`** - Published by Payment Service on refund. Consumed by Email handler.
