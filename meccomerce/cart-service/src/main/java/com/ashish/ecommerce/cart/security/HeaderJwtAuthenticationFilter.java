package com.ashish.ecommerce.cart.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class HeaderJwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userIdHeader = request.getHeader("X-User-Id");
        String emailHeader = request.getHeader("X-User-Email");
        String rolesHeader = request.getHeader("X-User-Roles");

        if (userIdHeader != null && emailHeader != null) {
            try {
                Long userId = Long.parseLong(userIdHeader);
                List<String> roles = rolesHeader != null && !rolesHeader.isBlank()
                        ? Arrays.asList(rolesHeader.split(","))
                        : Collections.singletonList("ROLE_USER");

                UserPrincipal principal = new UserPrincipal(userId, emailHeader, roles);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities()
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (NumberFormatException ignored) {
            }
        }

        filterChain.doFilter(request, response);
    }
}
