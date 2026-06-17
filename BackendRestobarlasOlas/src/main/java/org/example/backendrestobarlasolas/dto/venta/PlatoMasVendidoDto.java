package org.example.backendrestobarlasolas.dto.venta;

import java.math.BigDecimal;

public record PlatoMasVendidoDto(
        Integer platoId,
        String platoNombre,
        Long cantidad,
        BigDecimal ingresos
) {}
