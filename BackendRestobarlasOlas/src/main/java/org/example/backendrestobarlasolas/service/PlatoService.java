package org.example.backendrestobarlasolas.service;

import org.example.backendrestobarlasolas.model.Plato;

import java.util.List;
import java.util.Optional;

public interface PlatoService extends CrudService<Plato, Integer> {

    List<Plato> findByCategoriaId(Integer categoriaId);

    List<Plato> findActivos();

    List<Plato> findActivosByCategoria(Integer categoriaId);

    List<Plato> findAllWithCategoria();

    Optional<Plato> findByIdWithCategoria(Integer id);

    List<Plato> findByCategoriaIdWithCategoria(Integer categoriaId);

    List<Plato> findActivosWithCategoria();

    List<Plato> findActivosByCategoriaWithCategoria(Integer categoriaId);
}
