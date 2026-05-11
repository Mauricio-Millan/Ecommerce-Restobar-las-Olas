package org.example.backendrestobarlasolas.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatoAgregadosId implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer idPlato;
    private Integer idAgregado;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlatoAgregadosId)) return false;
        PlatoAgregadosId that = (PlatoAgregadosId) o;
        return Objects.equals(idPlato, that.idPlato) &&
               Objects.equals(idAgregado, that.idAgregado);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPlato, idAgregado);
    }
}

