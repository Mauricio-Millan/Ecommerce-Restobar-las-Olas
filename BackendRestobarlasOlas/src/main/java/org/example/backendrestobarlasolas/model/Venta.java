package org.example.backendrestobarlasolas.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "direccion_entrega", length = 255)
    private String direccionEntrega;

    @Column(name = "es_delivery")
    private Boolean esDelivery;

    @Column(name = "estado_venta", length = 50)
    @jakarta.persistence.Convert(converter = VentaEstadoConverter.class)
    private VentaEstado estadoVenta;

    @Column(name = "fecha_venta")
    private OffsetDateTime fechaVenta;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(name = "tipo_comprobante", length = 50)
    private String tipoComprobante;

    @Column(name = "numero_comprobante", length = 50)
    private String numeroComprobante;

    @Column(name = "voucher_url", columnDefinition = "TEXT")
    private String voucherUrl;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    @OneToMany(mappedBy = "venta", fetch = FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonAlias({"detalleVenta", "detalle_venta", "items"})
    private List<DetalleVenta> detalles = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (total == null) {
            total = BigDecimal.ZERO;
        }
        if (esDelivery == null) {
            esDelivery = Boolean.FALSE;
        }
        if (estadoVenta == null) {
            estadoVenta = VentaEstado.NUEVO;
        }
        if (fechaVenta == null) {
            fechaVenta = OffsetDateTime.now();
        }
    }
}

