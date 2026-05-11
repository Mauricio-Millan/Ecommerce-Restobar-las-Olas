package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Plato;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlatoRepository extends JpaRepository<Plato, Integer> {

    List<Plato> findByCategoria_Id(Integer categoriaId);
}

