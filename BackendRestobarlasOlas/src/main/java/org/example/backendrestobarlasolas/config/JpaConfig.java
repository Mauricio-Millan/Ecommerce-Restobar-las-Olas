package org.example.backendrestobarlasolas.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewInterceptor;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de JPA y transacciones para Supabase/PostgreSQL.
 * Las propiedades específicas están en application.properties:
 * - spring.jpa.hibernate.ddl-auto=validate (respeta el schema existente)
 * - spring.datasource.hikari.* (pool de conexiones optimizado)
 * - spring.jpa.open-in-view=false (ver abajo por qué se maneja manualmente)
 */
@Configuration
@EnableTransactionManagement
public class JpaConfig implements WebMvcConfigurer {

    private final EntityManagerFactory entityManagerFactory;

    public JpaConfig(EntityManagerFactory entityManagerFactory) {
        this.entityManagerFactory = entityManagerFactory;
    }

    /**
     * Reimplementa Open-Session-In-View manualmente, excluyendo el endpoint SSE
     * (/api/ventas/stream). Con open-in-view=true (default de Spring Boot), Hibernate
     * mantiene la conexión JDBC atada a la request durante TODA la vida del SseEmitter
     * (que no tiene timeout), por lo que cada cliente conectado al Kanban agota una
     * conexión del pool de Hikari de forma permanente hasta que cierra la pestaña.
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        OpenEntityManagerInViewInterceptor interceptor = new OpenEntityManagerInViewInterceptor();
        interceptor.setEntityManagerFactory(entityManagerFactory);
        registry.addWebRequestInterceptor(interceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/api/ventas/stream");
    }
}

