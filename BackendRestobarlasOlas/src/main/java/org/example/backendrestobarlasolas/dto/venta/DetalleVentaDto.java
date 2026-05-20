package org.example.backendrestobarlasolas.dto.venta;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para representar un detalle de venta con plato y agregados.
 */
public record DetalleVentaDto(
    Integer id,
    Integer platoId,
    String platoNombre,
    String platoDescripcion,
    String platoUrlImagen,
    BigDecimal precioUnitarioHistorico,
    Integer cantidad,
    String estadoItem,
    List<DetalleVentaAgregadoDto> agregados
) {}

