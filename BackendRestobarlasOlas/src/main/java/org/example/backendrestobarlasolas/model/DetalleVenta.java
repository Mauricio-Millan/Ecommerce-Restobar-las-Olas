package org.example.backendrestobarlasolas.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "detalle_venta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta")
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plato")
    @JsonAlias({"plato", "plato_data"})
    private Plato plato;

    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @JsonAlias({"idPlato", "platoId", "id_plato"})
    private Integer platoId;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario_historico", nullable = false, precision = 10, scale = 2)
    @JsonAlias({"precio_unitario_historico", "precioUnitario"})
    private BigDecimal precioUnitarioHistorico;

    @Column(name = "estado_item", length = 50)
    @jakarta.persistence.Convert(converter = VentaEstadoConverter.class)
    private org.example.backendrestobarlasolas.model.VentaEstado estadoItem;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    @OneToMany(mappedBy = "detalleVenta", fetch = FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonAlias({"detalle_venta_agregados"})
    private List<DetalleVentaAgregado> detalleVentaAgregados = new ArrayList<>();

    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @JsonAlias({"agregadosIds", "idsAgregados", "id_agregados", "agregados"})
    private List<Integer> agregadosIds;

    @PrePersist
    void prePersist() {
        if (estadoItem == null) {
            estadoItem = org.example.backendrestobarlasolas.model.VentaEstado.NUEVO;
        }
    }
}

