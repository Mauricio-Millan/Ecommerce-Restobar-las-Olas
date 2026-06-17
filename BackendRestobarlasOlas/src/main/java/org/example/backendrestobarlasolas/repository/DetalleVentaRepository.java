package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {

    List<DetalleVenta> findByVenta_Id(Integer ventaId);

    @org.springframework.data.jpa.repository.Query("SELECT d.plato.id, d.plato.nombre, SUM(d.cantidad), SUM(d.cantidad * d.precioUnitarioHistorico) " +
           "FROM DetalleVenta d " +
           "GROUP BY d.plato.id, d.plato.nombre " +
           "ORDER BY SUM(d.cantidad) DESC")
    List<Object[]> findPlatosMasVendidosRaw();
}

