package org.example.backendrestobarlasolas.dto.venta;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO para respuestas de Venta que incluye todos los detalles sin problemas de lazy loading.
 */
public record VentaResponseDto(
    Integer id,
    String usuarioId,
    String usuarioNombre,
    String usuarioApellido,
    BigDecimal total,
    String direccionEntrega,
    Boolean esDelivery,
    String estadoVenta,
    OffsetDateTime fechaVenta,
    String metodoPago,
    String tipoComprobante,
    String numeroComprobante,
    String voucherUrl,
    List<DetalleVentaDto> detalles
) {}

