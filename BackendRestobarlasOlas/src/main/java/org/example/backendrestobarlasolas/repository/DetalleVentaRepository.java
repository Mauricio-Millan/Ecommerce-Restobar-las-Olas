package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {

    List<DetalleVenta> findByVenta_Id(Integer ventaId);
}

