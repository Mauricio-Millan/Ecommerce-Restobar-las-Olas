package org.example.backendrestobarlasolas.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Convierte entre {@link VentaEstado} y su representación en la base de datos (String).
 */
@Converter(autoApply = true)
public class VentaEstadoConverter implements AttributeConverter<VentaEstado, String> {

    @Override
    public String convertToDatabaseColumn(VentaEstado attribute) {
        return attribute != null ? attribute.getDbValue() : null;
    }

    @Override
    public VentaEstado convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        VentaEstado e = VentaEstado.fromDbValue(dbData);
        // Fallback: if no match, try direct mapping by name
        return e;
    }
}

