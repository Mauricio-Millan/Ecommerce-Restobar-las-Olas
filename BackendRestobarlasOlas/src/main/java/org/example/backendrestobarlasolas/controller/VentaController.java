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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/ventas")
public class VentaController extends AbstractCrudController<Venta, Integer> {

    private final VentaService ventaService;
    private final org.example.backendrestobarlasolas.service.VentaSseEmitterService ventaSseEmitterService;

    public VentaController(VentaService service, org.example.backendrestobarlasolas.service.VentaSseEmitterService ventaSseEmitterService) {
        super(service);
        this.ventaService = service;
        this.ventaSseEmitterService = ventaSseEmitterService;
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

    /**
     * Lista todos los pedidos de un cliente ordenados del más reciente al más antiguo.
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<java.util.List<VentaResponseDto>> getVentasPorUsuario(@PathVariable java.util.UUID usuarioId) {
        java.util.List<VentaResponseDto> ventas = ventaService.getVentasPorUsuario(usuarioId);
        return ResponseEntity.ok(ventas);
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
     * SSE endpoint para recibir actualizaciones en tiempo real del Kanban.
     * El cliente puede conectarse y recibirá eventos con name 'venta-update' cuando
     * haya cambios en las ventas (nuevas ventas o cambios de estado).
     */
    @GetMapping("/stream")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamVentas() {
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = ventaSseEmitterService.registerEmitter();
        // Envío inicial del estado actual del Kanban al cliente que se conecta
        try {
            java.util.List<VentaResponseDto> initial = ((VentaServiceImpl) ventaService).getVentasCocinaDto();
            emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event().name("initial").data(initial));
        } catch (Exception e) {
            log.debug("No se pudo enviar snapshot inicial por SSE: {}", e.getMessage());
        }
        return emitter;
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

    @GetMapping("/reportes/platos-mas-vendidos")
    public ResponseEntity<java.util.List<org.example.backendrestobarlasolas.dto.venta.PlatoMasVendidoDto>> getPlatosMasVendidos(
            @RequestParam(name = "limit", required = false, defaultValue = "10") int limit) {
        return ResponseEntity.ok(ventaService.getPlatosMasVendidos(limit));
    }

    @GetMapping("/exportar/csv")
    public ResponseEntity<byte[]> exportarCsv(
            @RequestParam(name = "fecha", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fecha) {
        java.time.LocalDate fechaQuery = (fecha != null) ? fecha : java.time.LocalDate.now();
        byte[] csvData = ventaService.exportVentasCsv(fechaQuery);

        String filename = "reporte-ventas-" + fechaQuery + ".csv";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvData);
    }

    @GetMapping("/exportar/excel")
    public ResponseEntity<byte[]> exportarExcel(
            @RequestParam(name = "fecha", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fecha) {
        java.time.LocalDate fechaQuery = (fecha != null) ? fecha : java.time.LocalDate.now();
        byte[] excelData = ventaService.exportVentasExcel(fechaQuery);

        String filename = "reporte-ventas-" + fechaQuery + ".xlsx";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(excelData);
    }
}
