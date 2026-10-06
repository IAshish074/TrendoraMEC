package com.ashish.ecommerce.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;

@Component
public class JwtUtils {

    @Value("${jwt.public-key-base64:}")
    private String publicKeyBase64;

    private PublicKey getPublicKey() {
        try {
            byte[] decoded = decodeToDerBytes(publicKeyBase64);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            return kf.generatePublic(spec);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse RSA Public Key for Gateway JWT verification", e);
        }
    }

    private byte[] decodeToDerBytes(String keyInput) {
        if (keyInput == null || keyInput.isBlank()) {
            throw new IllegalArgumentException("RSA Public Key is empty");
        }
        String content = keyInput.trim();
        if (!content.contains("-----BEGIN")) {
            try {
                byte[] firstDecode = Base64.getDecoder().decode(content.replaceAll("\\s+", ""));
                String str = new String(firstDecode, java.nio.charset.StandardCharsets.UTF_8);
                if (str.contains("-----BEGIN")) {
                    content = str;
                } else {
                    return firstDecode;
                }
            } catch (Exception ignored) {
            }
        }

        String pemCleaned = content
                .replaceAll("-----\\w+ (PRIVATE|PUBLIC) KEY-----", "")
                .replaceAll("\\s+", "");

        return Base64.getDecoder().decode(pemCleaned);
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(getPublicKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(Claims claims) {
        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List) {
            return (List<String>) rolesObj;
        }
        return List.of();
    }
}
