package org.example.backendrestobarlasolas.service;

import org.example.backendrestobarlasolas.model.Agregado;
import org.example.backendrestobarlasolas.model.PlatoAgregados;
import org.example.backendrestobarlasolas.model.PlatoAgregadosId;

import java.util.List;

public interface PlatoAgregadosService extends CrudService<PlatoAgregados, PlatoAgregadosId> {

    List<PlatoAgregados> findByPlatoId(Integer platoId);

    List<Agregado> findAgregadosByPlatoId(Integer platoId);
}
