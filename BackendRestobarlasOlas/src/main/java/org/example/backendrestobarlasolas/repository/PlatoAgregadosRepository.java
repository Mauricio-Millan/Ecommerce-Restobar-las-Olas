package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.PlatoAgregados;
import org.example.backendrestobarlasolas.model.PlatoAgregadosId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlatoAgregadosRepository extends JpaRepository<PlatoAgregados, PlatoAgregadosId> {

    List<PlatoAgregados> findByPlato_Id(Integer platoId);

    List<PlatoAgregados> findByAgregado_Id(Integer agregadoId);
}

