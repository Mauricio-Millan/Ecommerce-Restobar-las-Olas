package org.example.backendrestobarlasolas.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "plato_agregados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatoAgregados {

    @EmbeddedId
    private PlatoAgregadosId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPlato")
    @JoinColumn(name = "id_plato")
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private Plato plato;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idAgregado")
    @JoinColumn(name = "id_agregado")
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private Agregado agregado;
}
