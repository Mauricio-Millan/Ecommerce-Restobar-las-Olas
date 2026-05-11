package org.example.backendrestobarlasolas.model;

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
    private String estadoVenta;

    @Column(name = "fecha_venta")
    private OffsetDateTime fechaVenta;

    @JsonIgnore
    @OneToMany(mappedBy = "venta", fetch = FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
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
            estadoVenta = "Pendiente";
        }
        if (fechaVenta == null) {
            fechaVenta = OffsetDateTime.now();
        }
    }
}

