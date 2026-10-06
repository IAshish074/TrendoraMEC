package com.ashish.ecommerce.gateway.filter;

import com.ashish.ecommerce.common.util.CorrelationUtils;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RequestCorrelationFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String existingCorrelationId = request.getHeaders().getFirst(CorrelationUtils.CORRELATION_ID_HEADER);
        String correlationId = CorrelationUtils.getOrCreateCorrelationId(existingCorrelationId);

        ServerHttpRequest mutatedRequest = request.mutate()
                .header(CorrelationUtils.CORRELATION_ID_HEADER, correlationId)
                .build();

        exchange.getResponse().getHeaders().add(CorrelationUtils.CORRELATION_ID_HEADER, correlationId);

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
