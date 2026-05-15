package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Agregado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgregadoRepository extends JpaRepository<Agregado, Integer> {

    List<Agregado> findByActivoTrue();
}
