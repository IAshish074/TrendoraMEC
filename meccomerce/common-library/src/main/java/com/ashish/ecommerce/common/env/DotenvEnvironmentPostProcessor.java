package com.ashish.ecommerce.common.env;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Automatically loads .env properties into Spring Environment if present.
 * Enables zero-config CLI execution of Spring Boot microservices with production / local environment files.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        File envFile = findDotenvFile();
        if (envFile != null && envFile.exists()) {
            Map<String, Object> envProperties = parseDotenv(envFile);
            if (!envProperties.isEmpty()) {
                // Add dotenv properties as high priority source (above application.yml defaults)
                environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envProperties));
            }
        }
    }

    private File findDotenvFile() {
        Path searchDir = Paths.get("").toAbsolutePath();
        for (int i = 0; i < 5; i++) {
            File env = searchDir.resolve(".env").toFile();
            if (env.exists() && env.isFile()) {
                return env;
            }
            if (searchDir.getParent() != null) {
                searchDir = searchDir.getParent();
            } else {
                break;
            }
        }
        return null;
    }

    private Map<String, Object> parseDotenv(File file) {
        Map<String, Object> map = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    String key = line.substring(0, eqIdx).trim();
                    String val = line.substring(eqIdx + 1).trim();

                    // Strip optional leading/trailing inline comment if not quoted
                    if (!val.startsWith("\"") && !val.startsWith("'") && val.contains("#")) {
                        val = val.substring(0, val.indexOf('#')).trim();
                    }

                    // Strip outer quotes
                    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.substring(1, val.length() - 1);
                    }

                    // Only add if not overridden by System environment variable
                    if (System.getenv(key) == null || System.getenv(key).isBlank()) {
                        map.put(key, val);

                        // Synthesize standard Spring Boot properties for seamless binding
                        if ("POSTGRES_ADMIN_USER".equals(key)) {
                            map.put("SPRING_DATASOURCE_USERNAME", val);
                            map.put("spring.datasource.username", val);
                        } else if ("POSTGRES_ADMIN_PASSWORD".equals(key)) {
                            map.put("SPRING_DATASOURCE_PASSWORD", val);
                            map.put("spring.datasource.password", val);
                        } else if ("RABBITMQ_HOST".equals(key)) {
                            map.put("spring.rabbitmq.host", val);
                        } else if ("RABBITMQ_PORT".equals(key)) {
                            map.put("spring.rabbitmq.port", val);
                        } else if ("RABBITMQ_USER".equals(key)) {
                            map.put("spring.rabbitmq.username", val);
                        } else if ("RABBITMQ_PASSWORD".equals(key)) {
                            map.put("spring.rabbitmq.password", val);
                        } else if ("RABBITMQ_VHOST".equals(key)) {
                            map.put("spring.rabbitmq.virtual-host", val);
                        } else if ("RABBITMQ_SSL_ENABLED".equals(key)) {
                            map.put("spring.rabbitmq.ssl.enabled", Boolean.parseBoolean(val));
                        } else if ("MAIL_HOST".equals(key)) {
                            map.put("spring.mail.host", val);
                        } else if ("MAIL_PORT".equals(key)) {
                            map.put("spring.mail.port", val);
                        } else if ("MAIL_USERNAME".equals(key)) {
                            map.put("spring.mail.username", val);
                        } else if ("MAIL_PASSWORD".equals(key)) {
                            map.put("spring.mail.password", val);
                        }
                    }
                }
            }
        } catch (IOException ignored) {
        }
        return map;
    }
}
