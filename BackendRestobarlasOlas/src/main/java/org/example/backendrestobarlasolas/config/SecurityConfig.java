package org.example.backendrestobarlasolas.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Configuration
public class SecurityConfig {

    @Value("${app.security.supabase.issuer:https://rlirstxwbmvfkqrbeogl.supabase.co/auth/v1}")
    private String supabaseIssuer;

    @Value("${app.security.supabase.jwk-set-uri:https://rlirstxwbmvfkqrbeogl.supabase.co/auth/v1/.well-known/jwks.json}")
    private String supabaseJwkSetUri;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register-profile").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .anyRequest().permitAll())
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(supabaseJwkSetUri).build();
        OAuth2TokenValidator<Jwt> validator = JwtValidators.createDefaultWithIssuer(supabaseIssuer);
        decoder.setJwtValidator(validator);
        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter defaultAuthorities = new JwtGrantedAuthoritiesConverter();
        defaultAuthorities.setAuthorityPrefix("ROLE_");
        defaultAuthorities.setAuthoritiesClaimName("scope");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Set<org.springframework.security.core.GrantedAuthority> authorities = new HashSet<>();
            Collection<org.springframework.security.core.GrantedAuthority> jwtAuthorities = defaultAuthorities
                    .convert(jwt);
            authorities.addAll(jwtAuthorities);

            String customRole = extractCustomRole(jwt.getClaims());
            if (StringUtils.hasText(customRole)) {
                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        "ROLE_" + customRole.trim().toUpperCase()));
            }
            authorities
                    .add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_AUTHENTICATED"));
            return authorities;
        });
        return converter;
    }

    private String extractCustomRole(Map<String, Object> claims) {
        Object directRole = claims.get("custom_role");
        if (directRole instanceof String role && StringUtils.hasText(role)) {
            return role;
        }

        Object appMetadata = claims.get("app_metadata");
        if (appMetadata instanceof Map<?, ?> metadata) {
            Object role = metadata.get("role");
            if (role instanceof String roleValue && StringUtils.hasText(roleValue)) {
                return roleValue;
            }
        }

        Object userMetadata = claims.get("user_metadata");
        if (userMetadata instanceof Map<?, ?> metadata) {
            Object role = metadata.get("rol");
            if (role instanceof String roleValue && StringUtils.hasText(roleValue)) {
                return roleValue;
            }
        }

        return null;
    }
}
