package org.example.backendrestobarlasolas.service;

import org.example.backendrestobarlasolas.model.Agregado;

import java.util.List;

public interface AgregadoService extends CrudService<Agregado, Integer> {

    List<Agregado> findActivos();
}
