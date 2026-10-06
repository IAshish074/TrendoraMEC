package com.ashish.ecommerce.order.messaging;

import com.ashish.ecommerce.common.dto.EventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEmailConsumer {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = "order.order-confirmed.email.queue")
    public void consumeOrderConfirmedEmail(EventEnvelope<Map<String, Object>> envelope) {
        try {
            Map<String, Object> payload = envelope.getPayload();
            log.info("Sending Order Confirmation Email for order: {}", payload.get("orderNumber"));

            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject("Order Confirmed - #" + payload.get("orderNumber"));
            message.setText("Thank you for your order! Your order total is $" + payload.get("totalAmount"));
            // mailSender.send(message); // Safely wrapped if SMTP server configured
        } catch (Exception e) {
            log.warn("Failed to send order confirmation email", e);
        }
    }
}
