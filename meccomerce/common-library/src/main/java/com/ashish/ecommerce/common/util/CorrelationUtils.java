package com.ashish.ecommerce.common.util;

import java.util.UUID;

public class CorrelationUtils {
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    public static String getOrCreateCorrelationId(String currentCorrelationId) {
        if (currentCorrelationId != null && !currentCorrelationId.trim().isEmpty()) {
            return currentCorrelationId;
        }
        return UUID.randomUUID().toString();
    }
}
