package org.example.backendrestobarlasolas.model;

import java.util.Locale;

/**
 * Enum que representa los estados permitidos para una Venta.
 * Cada valor tiene un dbValue (la representación en la base) y se
 * proporciona un método estático para mapear valores legacy como "Pendiente"
 * o variantes femeninas ("Entregada") hacia el estado correspondiente.
 */
public enum VentaEstado {
    NUEVO("Nuevo"),
    EN_PREPARACION("En Preparación"),
    LISTO("Listo"),
    ENTREGADO("Entregado"),
    CANCELADO("Cancelado");

    private final String dbValue;

    VentaEstado(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    @Override
    public String toString() {
        return dbValue;
    }

    public static VentaEstado fromDbValue(String value) {
        if (value == null) return null;
        String v = value.trim();
        // Normalizar algunas variantes comunes
        String low = v.toLowerCase(Locale.ROOT);
        switch (low) {
            case "pendiente":
            case "pedido":
            case "pedidos":
            case "nuevo":
            case "nuevos":
                return NUEVO;
            case "en preparacion":
            case "en preparación":
            case "en preparaciÓn":
            case "en preparaciOn":
                return EN_PREPARACION;
            case "listo":
            case "listos":
                return LISTO;
            case "entregado":
            case "entregada":
                return ENTREGADO;
            case "cancelado":
            case "cancelada":
                return CANCELADO;
            default:
                // Try to match by enum name
                try {
                    return VentaEstado.valueOf(v.replaceAll("[^A-Za-z0-9_]","_").toUpperCase(Locale.ROOT));
                } catch (Exception e) {
                    return null;
                }
        }
    }

    /**
     * Valor que debería exponerse a la UI (legacy compatibility). Algunos frontends esperan formas plurales
     * como "Nuevos" o "Listos" para el Kanban.
     */
    public String getApiValue() {
        switch (this) {
            case NUEVO:
                return "Nuevos";
            case EN_PREPARACION:
                return "En Preparacion";
            case LISTO:
                return "Listos";
            case ENTREGADO:
                return "Entregado";
            case CANCELADO:
                return "Cancelado";
            default:
                return this.getDbValue();
        }
    }
}

