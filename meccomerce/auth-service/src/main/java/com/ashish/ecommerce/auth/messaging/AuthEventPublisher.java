package com.ashish.ecommerce.auth.messaging;

import com.ashish.ecommerce.common.dto.EventEnvelope;
import com.ashish.ecommerce.common.util.CorrelationUtils;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange:ecommerce.events}")
    private String exchange;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRegisteredEventPayload {
        private Long userId;
        private String name;
        private String email;
    }

    public void publishUserRegistered(Long userId, String email, String name) {
        publishUserRegistered(userId, email, name, null);
    }

    public void publishUserRegistered(Long userId, String email, String name, String correlationId) {
        try {
            UserRegisteredEventPayload payload = UserRegisteredEventPayload.builder()
                    .userId(userId)
                    .name(name)
                    .email(email)
                    .build();

            String validCorrelationId = CorrelationUtils.getOrCreateCorrelationId(correlationId);

            EventEnvelope<UserRegisteredEventPayload> envelope = EventEnvelope.create(
                    "USER_REGISTERED",
                    "auth-service",
                    validCorrelationId,
                    payload
            );

            rabbitTemplate.convertAndSend(exchange, "user.registered", envelope);
            log.info("Published USER_REGISTERED event for userId: {}", userId);
        } catch (Exception e) {
            log.error("Failed to publish USER_REGISTERED event for userId: {}", userId, e);
        }
    }
}
