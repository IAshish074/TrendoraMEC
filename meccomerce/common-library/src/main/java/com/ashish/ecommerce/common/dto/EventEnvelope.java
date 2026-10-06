package com.ashish.ecommerce.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventEnvelope<T> {
    private String eventId;
    private String eventType;
    private int eventVersion;
    private String source;
    private LocalDateTime occurredAt;
    private String correlationId;
    private T payload;

    public static <T> EventEnvelope<T> create(String eventType, String source, String correlationId, T payload) {
        return EventEnvelope.<T>builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .eventVersion(1)
                .source(source)
                .occurredAt(LocalDateTime.now())
                .correlationId(correlationId != null ? correlationId : UUID.randomUUID().toString())
                .payload(payload)
                .build();
    }
}
