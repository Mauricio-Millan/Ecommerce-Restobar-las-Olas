package org.example.backendrestobarlasolas.service;

import org.example.backendrestobarlasolas.dto.venta.PlatoMasVendidoDto;
import org.example.backendrestobarlasolas.dto.venta.VentaResponseDto;
import org.example.backendrestobarlasolas.model.Venta;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VentaService extends CrudService<Venta, Integer> {
    Optional<Venta> getVentaActivaPorUsuario(java.util.UUID usuarioId);
    List<VentaResponseDto> getVentasPorUsuario(java.util.UUID usuarioId);
    String getEstadoVenta(Integer id);
    List<Venta> getVentasCocina();
    List<VentaResponseDto> getVentasCocinaDto();
    Venta actualizarEstadoVenta(Integer id, org.example.backendrestobarlasolas.model.VentaEstado nuevoEstado);
    List<Venta> getEntregadasOCanceladasUltimas24Horas();
    List<PlatoMasVendidoDto> getPlatosMasVendidos(int limit);
    byte[] exportVentasCsv(LocalDate fecha);
    byte[] exportVentasExcel(LocalDate fecha);
}
