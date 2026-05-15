package org.example.backendrestobarlasolas.dto.catalog;

import java.math.BigDecimal;

public record PlatoCatalogDto(
        Integer id,
        Integer categoriaId,
        String categoriaNombre,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String urlImagen,
        Boolean activo
) {
}

