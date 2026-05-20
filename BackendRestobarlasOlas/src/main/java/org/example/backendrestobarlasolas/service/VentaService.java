package org.example.backendrestobarlasolas.service;

import org.example.backendrestobarlasolas.dto.venta.VentaResponseDto;
import org.example.backendrestobarlasolas.model.Venta;

public interface VentaService extends CrudService<Venta, Integer> {
    java.util.Optional<Venta> getVentaActivaPorUsuario(java.util.UUID usuarioId);
    String getEstadoVenta(Integer id);
    java.util.List<Venta> getVentasCocina();
    java.util.List<VentaResponseDto> getVentasCocinaDto();
    Venta actualizarEstadoVenta(Integer id, org.example.backendrestobarlasolas.model.VentaEstado nuevoEstado);
    java.util.List<Venta> getEntregadasOCanceladasUltimas24Horas();
}
