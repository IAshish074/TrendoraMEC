package com.ashish.ecommerce.gateway.security;

import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        super(Config.class);
        this.jwtUtils = jwtUtils;
    }

    public static class Config {
        private boolean requireAdmin = false;
        // optional=true: routes with public endpoints (e.g. GET /api/products) pass through
        // without a token, but a token that IS sent gets validated and user headers are set.
        private boolean optional = false;

        public boolean isOptional() {
            return optional;
        }

        public void setOptional(boolean optional) {
            this.optional = optional;
        }

        public boolean isRequireAdmin() {
            return requireAdmin;
        }

        public void setRequireAdmin(boolean requireAdmin) {
            this.requireAdmin = requireAdmin;
        }
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (originalExchange, chain) -> {
            ServerWebExchange exchange = originalExchange;
            ServerHttpRequest request = exchange.getRequest();

            // OPTIONS preflight requests must bypass JWT validation
            if (request.getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }

            // Never trust identity headers coming from the client - only the gateway may set them.
            ServerHttpRequest sanitized = request.mutate()
                    .headers(h -> {
                        h.remove("X-User-Id");
                        h.remove("X-User-Email");
                        h.remove("X-User-Roles");
                    })
                    .build();
            exchange = exchange.mutate().request(sanitized).build();
            request = sanitized;

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null) {
                if (config.isOptional()) {
                    return chain.filter(exchange);
                }
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            if (!authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String token = authHeader.substring(7);
            try {
                Claims claims = jwtUtils.validateToken(token);
                Object userIdObj = claims.get("userId");
                String userId = userIdObj != null ? String.valueOf(userIdObj) : "";
                String email = claims.getSubject();
                List<String> roles = jwtUtils.getRoles(claims);

                if (config.isRequireAdmin() && (roles == null || !roles.contains("ROLE_ADMIN"))) {
                    exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                    return exchange.getResponse().setComplete();
                }

                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", userId != null ? userId : "")
                        .header("X-User-Email", email != null ? email : "")
                        .header("X-User-Roles", roles != null ? String.join(",", roles) : "")
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                log.warn("JWT rejected for {} {}: {}", request.getMethod(), request.getPath(), e.toString());
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        };
    }
}
