package com.teamtaskers.teamtaskers.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // ✅ Required when using JWT + Authorization header
        config.setAllowCredentials(true);

        // ✅ Allowed frontend origins (LOCAL + PRODUCTION)
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:8081",
                "https://team-taskers-i6q9.onrender.com"
        ));

        // ✅ Allowed HTTP methods
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        // ✅ Allow all headers (Authorization included)
        config.setAllowedHeaders(List.of("*"));

        // ✅ Optional: expose headers if needed
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
