package org.example.backendrestobarlasolas.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Configuración de JPA y transacciones para Supabase/PostgreSQL.
 * Las propiedades específicas están en application.properties:
 * - spring.jpa.hibernate.ddl-auto=validate (respeta el schema existente)
 * - spring.datasource.hikari.* (pool de conexiones optimizado)
 */
@Configuration
@EnableTransactionManagement
public class JpaConfig {
    // La configuración se carga desde application.properties
    // No es necesario sobrescribir propiedades aquí
}

