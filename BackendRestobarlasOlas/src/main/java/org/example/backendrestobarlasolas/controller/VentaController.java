package org.example.backendrestobarlasolas.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.backendrestobarlasolas.dto.venta.VentaResponseDto;
import org.example.backendrestobarlasolas.model.Venta;
import org.example.backendrestobarlasolas.model.VentaEstado;
import org.example.backendrestobarlasolas.service.VentaService;
import org.example.backendrestobarlasolas.service.impl.VentaServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/ventas")
public class VentaController extends AbstractCrudController<Venta, Integer> {

    private final VentaService ventaService;

    public VentaController(VentaService service) {
        super(service);
        this.ventaService = service;
    }

    @Override
    protected void setId(Venta entity, Integer id) {
        entity.setId(id);
    }

    @GetMapping("/usuario/{usuarioId}/activo")
    public ResponseEntity<Venta> getVentaActiva(@PathVariable java.util.UUID usuarioId) {
        return ventaService.getVentaActivaPorUsuario(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}/estado")
    public ResponseEntity<java.util.Map<String, String>> getEstadoVenta(@PathVariable Integer id) {
        String estado = ventaService.getEstadoVenta(id);
        if (estado != null) {
            return ResponseEntity.ok(java.util.Map.of("estadoVenta", estado));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Endpoint de cocina con logs de depuración y DTO completo.
     */
    @GetMapping("/cocina")
    public ResponseEntity<java.util.List<VentaResponseDto>> getVentasCocina() {
        log.info("[VENTAS COCINA] Iniciando petición GET /api/ventas/cocina");
        java.util.List<VentaResponseDto> ventas = ((VentaServiceImpl) ventaService).getVentasCocinaDto();
        log.info("[VENTAS COCINA] Respuesta final enviada al frontend: {} ventas", ventas.size());
        return ResponseEntity.ok(ventas);
    }

    /**
     * Marca una venta como entregada. Fuera del kanban de cocina.
     */
    @PatchMapping("/{id}/entregar")
    public ResponseEntity<Venta> marcarEntregada(@PathVariable Integer id) {
        try {
            VentaEstado nuevo = VentaEstado.fromDbValue("Entregada");
            Venta actualizada = ventaService.actualizarEstadoVenta(id, nuevo);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Marca una venta como cancelada. Fuera del kanban de cocina.
     */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Venta> marcarCancelada(@PathVariable Integer id) {
        try {
            VentaEstado nuevo = VentaEstado.fromDbValue("Cancelada");
            Venta actualizada = ventaService.actualizarEstadoVenta(id, nuevo);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint que devuelve las ventas con estado Entregada o Cancelada de las últimas 24 horas.
     */
    @GetMapping("/historial-24h")
    public ResponseEntity<java.util.List<VentaResponseDto>> getEntregadasOCanceladasUltimas24Horas() {
        java.util.List<Venta> ventas = ((VentaServiceImpl) ventaService).getEntregadasOCanceladasUltimas24Horas();
        java.util.List<VentaResponseDto> dto = ventas.stream().map(((VentaServiceImpl) ventaService)::mapVentaToDto).toList();
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Venta> actualizarEstadoVenta(
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body) {
        String nuevoEstado = body.get("estadoVenta");
        if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        VentaEstado estadoEnum = VentaEstado.fromDbValue(nuevoEstado);
        if (estadoEnum == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Venta actualizada = ventaService.actualizarEstadoVenta(id, estadoEnum);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
