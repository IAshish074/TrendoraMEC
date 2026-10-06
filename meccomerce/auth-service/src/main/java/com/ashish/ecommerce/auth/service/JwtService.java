package com.ashish.ecommerce.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.issuer:trendora-auth}")
    private String issuer;

    @Value("${jwt.access-token-minutes:15}")
    private long accessTokenMinutes;

    @Value("${jwt.private-key-base64:}")
    private String privateKeyBase64;

    @Value("${jwt.public-key-base64:}")
    private String publicKeyBase64;

    private PrivateKey privateKey;
    private PublicKey publicKey;

    @PostConstruct
    public void initKeys() {
        // Fail fast: silently generating random keys makes tokens unverifiable by the gateway
        // and invalidates every session on each restart.
        if (privateKeyBase64 == null || privateKeyBase64.isBlank()
                || publicKeyBase64 == null || publicKeyBase64.isBlank()) {
            throw new IllegalStateException("JWT_PRIVATE_KEY_BASE64 and JWT_PUBLIC_KEY_BASE64 must both be set");
        }
        try {
            KeyFactory kf = KeyFactory.getInstance("RSA");
            this.privateKey = kf.generatePrivate(new PKCS8EncodedKeySpec(decodeToDerBytes(privateKeyBase64)));
            this.publicKey = kf.generatePublic(new X509EncodedKeySpec(decodeToDerBytes(publicKeyBase64)));
        } catch (Exception e) {
            throw new IllegalStateException("Invalid JWT RSA key configuration: " + e.getMessage(), e);
        }
    }

    private byte[] decodeToDerBytes(String keyInput) {
        if (keyInput == null || keyInput.isBlank()) {
            return null;
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

    public String generateAccessToken(Long userId, String email, List<String> roles) {
        long now = System.currentTimeMillis();
        long exp = now + (accessTokenMinutes * 60 * 1000);

        return Jwts.builder()
                .setSubject(email)
                .setIssuer(issuer)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(exp))
                .addClaims(Map.of(
                        "userId", userId,
                        "email", email,
                        "roles", roles
                ))
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }
}
