package org.example.backendrestobarlasolas.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.example.backendrestobarlasolas.dto.venta.DetalleVentaAgregadoDto;
import org.example.backendrestobarlasolas.dto.venta.DetalleVentaDto;
import org.example.backendrestobarlasolas.dto.venta.VentaResponseDto;
import org.example.backendrestobarlasolas.model.Agregado;
import org.example.backendrestobarlasolas.model.DetalleVenta;
import org.example.backendrestobarlasolas.model.DetalleVentaAgregado;
import org.example.backendrestobarlasolas.model.Plato;
import org.example.backendrestobarlasolas.model.Venta;
import org.example.backendrestobarlasolas.repository.AgregadoRepository;
import org.example.backendrestobarlasolas.repository.PlatoRepository;
import org.example.backendrestobarlasolas.repository.VentaRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.VentaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class VentaServiceImpl extends AbstractJpaCrudService<Venta, Integer> implements VentaService {

    private final PlatoRepository platoRepository;
    private final AgregadoRepository agregadoRepository;

    public VentaServiceImpl(VentaRepository repository, PlatoRepository platoRepository, AgregadoRepository agregadoRepository) {
        super(repository);
        this.platoRepository = platoRepository;
        this.agregadoRepository = agregadoRepository;
    }

    @Override
    @Transactional
    public Venta save(Venta venta) {
        prepararRelaciones(venta);
        venta.setTotal(calcularTotal(venta));
        Venta saved = repository.save(venta);
        log.info("[VENTA SAVE] Venta guardada id={}, estado={}, detalles={}",
                saved.getId(),
                saved.getEstadoVenta() != null ? saved.getEstadoVenta().getDbValue() : null,
                saved.getDetalles() != null ? saved.getDetalles().size() : 0);
        if (saved.getDetalles() != null) {
            for (DetalleVenta d : saved.getDetalles()) {
                log.info("[VENTA SAVE]   Detalle id={}, estadoItem={}", d.getId(), d.getEstadoItem() != null ? d.getEstadoItem().getDbValue() : null);
            }
        }
        return saved;
    }

    private void prepararRelaciones(Venta venta) {
        if (venta.getDetalles() == null) {
            return;
        }

        for (DetalleVenta detalle : venta.getDetalles()) {
            detalle.setVenta(venta);

            if (detalle.getPlato() == null && detalle.getPlatoId() != null) {
                Plato platoRef = new Plato();
                platoRef.setId(detalle.getPlatoId());
                detalle.setPlato(platoRef);
            }

            if ((detalle.getDetalleVentaAgregados() == null || detalle.getDetalleVentaAgregados().isEmpty())
                    && detalle.getAgregadosIds() != null
                    && !detalle.getAgregadosIds().isEmpty()) {
                List<DetalleVentaAgregado> seleccionados = new ArrayList<>();
                for (Integer agregadoId : detalle.getAgregadosIds()) {
                    if (agregadoId == null) {
                        continue;
                    }
                    Agregado agregadoRef = new Agregado();
                    agregadoRef.setId(agregadoId);
                    seleccionados.add(DetalleVentaAgregado.builder().agregado(agregadoRef).build());
                }
                detalle.setDetalleVentaAgregados(seleccionados);
            }

            if (detalle.getDetalleVentaAgregados() == null) {
                detalle.setDetalleVentaAgregados(new ArrayList<>());
                continue;
            }
            for (DetalleVentaAgregado agregadoSeleccionado : detalle.getDetalleVentaAgregados()) {
                if (agregadoSeleccionado.getAgregado() == null && agregadoSeleccionado.getAgregadoId() != null) {
                    Agregado agregadoRef = new Agregado();
                    agregadoRef.setId(agregadoSeleccionado.getAgregadoId());
                    agregadoSeleccionado.setAgregado(agregadoRef);
                }
                agregadoSeleccionado.setDetalleVenta(detalle);
            }
        }
    }

    private BigDecimal calcularTotal(Venta venta) {
        if (venta.getDetalles() == null || venta.getDetalles().isEmpty()) {
            return venta.getTotal() != null ? venta.getTotal() : BigDecimal.ZERO;
        }

        BigDecimal total = BigDecimal.ZERO;
        for (DetalleVenta detalle : venta.getDetalles()) {
            int cantidad = detalle.getCantidad() != null ? detalle.getCantidad() : 0;
            if (cantidad <= 0) {
                throw new IllegalArgumentException("La cantidad del detalle debe ser mayor a 0.");
            }

            BigDecimal precioUnitario = detalle.getPrecioUnitarioHistorico();
            if (precioUnitario == null && detalle.getPlato() != null && detalle.getPlato().getId() != null) {
                Plato platoBd = platoRepository.findById(detalle.getPlato().getId()).orElse(null);
                if (platoBd != null) {
                    detalle.setPlato(platoBd);
                    precioUnitario = platoBd.getPrecio();
                }
            }
            if (precioUnitario == null) {
                precioUnitario = BigDecimal.ZERO;
            }

            detalle.setPrecioUnitarioHistorico(precioUnitario);

            BigDecimal extrasPorUnidad = BigDecimal.ZERO;
            if (detalle.getDetalleVentaAgregados() != null) {
                for (DetalleVentaAgregado seleccionado : detalle.getDetalleVentaAgregados()) {
                    BigDecimal precioExtra = seleccionado.getPrecioExtraHistorico();
                    if (precioExtra == null && seleccionado.getAgregado() != null && seleccionado.getAgregado().getId() != null) {
                        Agregado agregadoBd = agregadoRepository.findById(seleccionado.getAgregado().getId()).orElse(null);
                        if (agregadoBd != null) {
                            seleccionado.setAgregado(agregadoBd);
                            precioExtra = agregadoBd.getPrecio();
                        }
                    }
                    if (precioExtra == null) {
                        precioExtra = BigDecimal.ZERO;
                    }

                    seleccionado.setPrecioExtraHistorico(precioExtra);
                    extrasPorUnidad = extrasPorUnidad.add(precioExtra);
                }
            }

            BigDecimal subtotalDetalle = precioUnitario.add(extrasPorUnidad).multiply(BigDecimal.valueOf(cantidad));
            total = total.add(subtotalDetalle);
        }

        return total;
    }

    @Override
    public java.util.Optional<Venta> getVentaActivaPorUsuario(java.util.UUID usuarioId) {
        // Consideramos "activa" cualquier venta que no esté finalizada (Entregado/Cancelado)
        return ((VentaRepository)repository).findFirstByUsuario_IdAndEstadoVentaNotInOrderByFechaVentaDesc(
                usuarioId,
                java.util.List.of(org.example.backendrestobarlasolas.model.VentaEstado.ENTREGADO, org.example.backendrestobarlasolas.model.VentaEstado.CANCELADO)
        );
    }

    @Override
    public String getEstadoVenta(Integer id) {
        return repository.findById(id)
                .map(Venta::getEstadoVenta)
                .map(estado -> estado != null ? estado.getDbValue() : null)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<Venta> getVentasCocina() {
        java.util.List<org.example.backendrestobarlasolas.model.VentaEstado> estadosDeseados = java.util.List.of(
                org.example.backendrestobarlasolas.model.VentaEstado.NUEVO,
                org.example.backendrestobarlasolas.model.VentaEstado.EN_PREPARACION,
                org.example.backendrestobarlasolas.model.VentaEstado.LISTO
        );
        log.info("[VENTAS COCINA] Buscando ventas con estados (enum)={}", estadosDeseados);
        List<Venta> ventas = ((VentaRepository)repository).findAllForKitchenWithDetallesByEstados(estadosDeseados);
        // Compatibilidad: si la base tiene registros con el estado histórico 'Pendiente' (valor por defecto en scripts),
        // intentamos una segunda búsqueda añadiendo 'Pendiente' (raw) para no romper el Kanban en instalaciones existentes.
        if (ventas.isEmpty()) {
            log.info("[VENTAS COCINA] No se encontraron ventas con estados {}. Intentando búsqueda de compatibilidad raw...", estadosDeseados);
            java.util.List<String> fallback = java.util.List.of(
                    "Nuevo", "Nuevos", "Pedido", "Pendiente",
                    "En Preparación", "En Preparacion",
                    "Listo", "Listos"
            );
            // Note: include multiple variants (accents/plurals) to maximize compatibility with existing DB values
            log.info("[VENTAS COCINA] Buscando ventas con estados (raw variants)={}", fallback);
            ventas = ((VentaRepository)repository).findAllForKitchenWithDetallesByEstadosRaw(fallback);
        }
        log.info("[VENTAS COCINA] Ventas encontradas: {}", ventas.size());
        for (Venta venta : ventas) {
            log.info("[VENTAS COCINA] Venta id={}, estado={}, total={}, detalles={}",
                    venta.getId(),
                    venta.getEstadoVenta(),
                    venta.getTotal(),
                    venta.getDetalles() != null ? venta.getDetalles().size() : 0);
        }
        return ventas;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<VentaResponseDto> getVentasCocinaDto() {
        List<Venta> ventas = getVentasCocina();
        List<VentaResponseDto> ventasDto = ventas.stream()
                .map(this::mapVentaToDto)
                .toList();

        log.info("[VENTAS COCINA DTO] DTOs generados: {}", ventasDto.size());
        for (VentaResponseDto dto : ventasDto) {
            log.info("[VENTAS COCINA DTO] VentaDTO id={}, total={}, detalles={}",
                    dto.id(),
                    dto.total(),
                    dto.detalles() != null ? dto.detalles().size() : 0);
            if (dto.detalles() != null) {
                for (DetalleVentaDto detalle : dto.detalles()) {
                    log.info("[VENTAS COCINA DTO]   Detalle id={}, platoId={}, plato={}, cantidad={}, agregados={}",
                            detalle.id(),
                            detalle.platoId(),
                            detalle.platoNombre(),
                            detalle.cantidad(),
                            detalle.agregados() != null ? detalle.agregados().size() : 0);
                    if (detalle.agregados() != null) {
                        for (DetalleVentaAgregadoDto agregado : detalle.agregados()) {
                            log.info("[VENTAS COCINA DTO]     Agregado id={}, agregadoId={}, nombre={}, extra={}",
                                    agregado.id(),
                                    agregado.agregadoId(),
                                    agregado.agregadoNombre(),
                                    agregado.precioExtraHistorico());
                        }
                    }
                }
            }
        }
        return ventasDto;
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<Venta> getEntregadasOCanceladasUltimas24Horas() {
        java.time.OffsetDateTime desde = java.time.OffsetDateTime.now().minusHours(24);
        List<Venta> ventas = ((VentaRepository)repository).findByEstadosAndFechaDesde(
                java.util.List.of(org.example.backendrestobarlasolas.model.VentaEstado.ENTREGADO, org.example.backendrestobarlasolas.model.VentaEstado.CANCELADO),
                desde
        );
        log.info("[VENTAS HISTORICO 24H] encontradas={}", ventas.size());
        return ventas;
    }

    /**
     * Mapea una entidad Venta a VentaResponseDto para evitar problemas de lazy loading.
     */
    @Transactional(readOnly = true)
    public VentaResponseDto mapVentaToDto(Venta venta) {
        List<DetalleVentaDto> detallesDto = new ArrayList<>();
        if (venta.getDetalles() != null) {
            for (DetalleVenta detalle : venta.getDetalles()) {
                List<DetalleVentaAgregadoDto> agregadosDto = new ArrayList<>();
                if (detalle.getDetalleVentaAgregados() != null) {
                    for (DetalleVentaAgregado dva : detalle.getDetalleVentaAgregados()) {
                        agregadosDto.add(new DetalleVentaAgregadoDto(
                                dva.getId(),
                                dva.getAgregado() != null ? dva.getAgregado().getId() : null,
                                dva.getAgregado() != null ? dva.getAgregado().getNombre() : null,
                                dva.getPrecioExtraHistorico()
                        ));
                    }
                }
                detallesDto.add(new DetalleVentaDto(
                        detalle.getId(),
                        detalle.getPlato() != null ? detalle.getPlato().getId() : null,
                        detalle.getPlato() != null ? detalle.getPlato().getNombre() : null,
                        detalle.getPlato() != null ? detalle.getPlato().getDescripcion() : null,
                        detalle.getPlato() != null ? detalle.getPlato().getUrlImagen() : null,
                        detalle.getPrecioUnitarioHistorico(),
                        detalle.getCantidad(),
                        detalle.getEstadoItem() != null ? detalle.getEstadoItem().getApiValue() : null,
                        agregadosDto
                ));
            }
        }

        VentaResponseDto dto = new VentaResponseDto(
                venta.getId(),
                venta.getUsuario() != null ? venta.getUsuario().getId().toString() : null,
                venta.getUsuario() != null ? venta.getUsuario().getNombre() : null,
                venta.getUsuario() != null ? venta.getUsuario().getApellido() : null,
                venta.getTotal(),
                venta.getDireccionEntrega(),
                venta.getEsDelivery(),
                venta.getEstadoVenta() != null ? venta.getEstadoVenta().getApiValue() : null,
                venta.getFechaVenta(),
                venta.getMetodoPago(),
                venta.getTipoComprobante(),
                venta.getNumeroComprobante(),
                venta.getVoucherUrl(),
                detallesDto
        );

        log.info("[VENTA DTO] id={}, detalles={}, total={}", dto.id(), dto.detalles() != null ? dto.detalles().size() : 0, dto.total());
        return dto;
    }

    @Override
    @Transactional
    public Venta actualizarEstadoVenta(Integer id, org.example.backendrestobarlasolas.model.VentaEstado nuevoEstado) {
        return repository.findById(id).map(venta -> {
            venta.setEstadoVenta(nuevoEstado);
            return repository.save(venta);
        }).orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));
    }
}
