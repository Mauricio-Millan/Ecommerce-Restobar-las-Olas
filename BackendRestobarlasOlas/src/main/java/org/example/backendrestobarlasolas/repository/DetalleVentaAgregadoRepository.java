package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.DetalleVentaAgregado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleVentaAgregadoRepository extends JpaRepository<DetalleVentaAgregado, Integer> {

    List<DetalleVentaAgregado> findByDetalleVenta_Id(Integer detalleVentaId);
}

