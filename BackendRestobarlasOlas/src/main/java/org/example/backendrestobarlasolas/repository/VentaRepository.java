package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VentaRepository extends JpaRepository<Venta, Integer> {

    List<Venta> findByUsuario_Id(UUID usuarioId);
}

