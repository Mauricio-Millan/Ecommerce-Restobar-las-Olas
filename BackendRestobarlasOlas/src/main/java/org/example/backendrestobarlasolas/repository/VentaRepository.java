package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.EntityGraph.EntityGraphType;

import java.util.List;
import org.example.backendrestobarlasolas.model.VentaEstado;
import java.util.Optional;
import java.util.UUID;

public interface VentaRepository extends JpaRepository<Venta, Integer> {

    List<Venta> findByUsuario_Id(UUID usuarioId);

    /**
     * Obtiene todas las ventas de un usuario ordenadas de más reciente a más antigua,
     * incluyendo detalles y plato para mapear a DTO sin problemas de lazy loading.
     */
    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.plato " +
           "WHERE v.usuario.id = :usuarioId " +
           "ORDER BY v.fechaVenta DESC")
    List<Venta> findAllByUsuarioIdWithDetallesOrderByFechaVentaDesc(UUID usuarioId);

    java.util.Optional<Venta> findFirstByUsuario_IdAndEstadoVentaNotInOrderByFechaVentaDesc(UUID usuarioId, List<VentaEstado> estados);

    List<Venta> findByEstadoVentaNotInOrderByFechaVentaAsc(List<VentaEstado> estados);

    /**
     * Obtiene una venta con detalles y platos usando fetch.
     * Los agregados se cargan lazy pero dentro de transacción abierta en el servicio.
     */
    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.plato " +
           "WHERE v.id = :id")
    Optional<Venta> findByIdWithDetalles(Integer id);

    /**
     * Obtiene todas las ventas que deben mostrarse en el kanban de cocina.
     * Filtra por los estados provistos en tiempo de ejecución para evitar desajustes entre
     * los valores almacenados en la base y los esperados por la UI.
     */
    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.plato " +
           "WHERE v.estadoVenta IN :estados " +
           "ORDER BY v.fechaVenta ASC")
    List<Venta> findAllForKitchenWithDetallesByEstados(java.util.List<VentaEstado> estados);

    /** Compatibilidad: búsqueda usando valores raw en BD (strings) para instalaciones previas. */
    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.plato " +
           "WHERE v.estadoVenta IN :estados " +
           "ORDER BY v.fechaVenta ASC")
    List<Venta> findAllForKitchenWithDetallesByEstadosRaw(java.util.List<String> estados);

    /**
     * Encuentra ventas con estado Entregada o Cancelada desde una fecha minima (ej. últimas 24 horas).
     */
    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.plato " +
           "WHERE v.estadoVenta IN :estados " +
           "AND v.fechaVenta >= :from " +
           "ORDER BY v.fechaVenta DESC")
    List<Venta> findByEstadosAndFechaDesde(java.util.List<VentaEstado> estados, java.time.OffsetDateTime from);

    /**
     * Obtiene ventas en un rango de fechas con detalles y platos cargados de forma temprana.
     */
    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.plato " +
           "WHERE v.fechaVenta >= :start AND v.fechaVenta < :end " +
           "ORDER BY v.fechaVenta DESC")
    List<Venta> findVentasByFecha(java.time.OffsetDateTime start, java.time.OffsetDateTime end);
}

