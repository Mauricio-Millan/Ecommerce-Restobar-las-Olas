package org.example.backendrestobarlasolas.dto.venta;

import java.math.BigDecimal;

/**
 * DTO para representar un agregado dentro de un detalle de venta.
 */
public record DetalleVentaAgregadoDto(
    Integer id,
    Integer agregadoId,
    String agregadoNombre,
    BigDecimal precioExtraHistorico
) {}

