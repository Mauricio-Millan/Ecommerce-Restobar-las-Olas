package org.example.backendrestobarlasolas.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.example.backendrestobarlasolas.dto.venta.DetalleVentaAgregadoDto;
import org.example.backendrestobarlasolas.dto.venta.DetalleVentaDto;
import org.example.backendrestobarlasolas.dto.venta.VentaResponseDto;
import org.example.backendrestobarlasolas.dto.venta.PlatoMasVendidoDto;
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
import org.example.backendrestobarlasolas.service.VentaSseEmitterService;
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
    private final VentaSseEmitterService sseEmitterService;
    private final org.example.backendrestobarlasolas.repository.DetalleVentaRepository detalleVentaRepository;

    public VentaServiceImpl(VentaRepository repository, PlatoRepository platoRepository, AgregadoRepository agregadoRepository, VentaSseEmitterService sseEmitterService, org.example.backendrestobarlasolas.repository.DetalleVentaRepository detalleVentaRepository) {
        super(repository);
        this.platoRepository = platoRepository;
        this.agregadoRepository = agregadoRepository;
        this.sseEmitterService = sseEmitterService;
        this.detalleVentaRepository = detalleVentaRepository;
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
        // Publicamos la actualización para clientes conectados al SSE (kanban en tiempo real)
        try {
            VentaResponseDto dto = mapVentaToDto(saved);
            sseEmitterService.publishVentaUpdate(dto);
        } catch (Exception e) {
            log.debug("No se pudo publicar evento SSE tras guardar venta: {}", e.getMessage());
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
    @Transactional(readOnly = true)
    public java.util.List<VentaResponseDto> getVentasPorUsuario(java.util.UUID usuarioId) {
        List<Venta> ventas = ((VentaRepository) repository).findAllByUsuarioIdWithDetallesOrderByFechaVentaDesc(usuarioId);
        return ventas.stream().map(this::mapVentaToDto).toList();
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
            Venta actualizada = repository.save(venta);
            // Notificamos por SSE el cambio de estado
            try {
                VentaResponseDto dto = mapVentaToDto(actualizada);
                sseEmitterService.publishVentaUpdate(dto);
            } catch (Exception e) {
                log.debug("No se pudo publicar evento SSE tras actualizar estado: {}", e.getMessage());
            }
            return actualizada;
        }).orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlatoMasVendidoDto> getPlatosMasVendidos(int limit) {
        List<Object[]> raw = detalleVentaRepository.findPlatosMasVendidosRaw();
        return raw.stream()
                .limit(limit > 0 ? limit : Long.MAX_VALUE)
                .map(row -> new PlatoMasVendidoDto(
                        (Integer) row[0],
                        (String) row[1],
                        (Long) row[2],
                        row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportVentasCsv(java.time.LocalDate fecha) {
        List<Venta> ventas = getVentasPorFecha(fecha);
        StringBuilder sb = new StringBuilder();
        // UTF-8 BOM to ensure Excel opens it correctly with accents
        sb.append("\uFEFF");
        sb.append("ID Venta,Cliente,Fecha,Total,Metodo Pago,Tipo Comprobante,Numero Comprobante,Delivery,Direccion,Estado\n");

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Venta v : ventas) {
            String cliente = v.getUsuario() != null ? v.getUsuario().getNombre() + " " + v.getUsuario().getApellido() : "Anónimo";
            String fechaStr = v.getFechaVenta() != null ? v.getFechaVenta().format(formatter) : "";
            sb.append(v.getId()).append(",")
              .append("\"").append(cliente.replace("\"", "\"\"")).append("\",")
              .append(fechaStr).append(",")
              .append(v.getTotal()).append(",")
              .append(v.getMetodoPago() != null ? v.getMetodoPago() : "").append(",")
              .append(v.getTipoComprobante() != null ? v.getTipoComprobante() : "").append(",")
              .append(v.getNumeroComprobante() != null ? v.getNumeroComprobante() : "").append(",")
              .append(v.getEsDelivery() != null && v.getEsDelivery() ? "Sí" : "No").append(",")
              .append("\"").append((v.getDireccionEntrega() != null ? v.getDireccionEntrega() : "").replace("\"", "\"\"")).append("\",")
              .append(v.getEstadoVenta() != null ? v.getEstadoVenta().getDbValue() : "").append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportVentasExcel(java.time.LocalDate fecha) {
        List<Venta> ventas = getVentasPorFecha(fecha);
        try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
             java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Reporte Ventas");

            // Cabeceras y estilos
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.WHITE.getIndex());

            org.apache.poi.ss.usermodel.CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.DARK_BLUE.getIndex());
            headerCellStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);

            // Crear fila de cabecera
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "ID Venta", "Cliente", "Fecha", "Total", "Método Pago", 
                    "Tipo Comprobante", "Número Comprobante", "Delivery", "Dirección", "Estado"
            };

            for (int col = 0; col < headers.length; col++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Formato para celdas
            org.apache.poi.ss.usermodel.CellStyle dateCellStyle = workbook.createCellStyle();
            dateCellStyle.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));

            org.apache.poi.ss.usermodel.CellStyle doubleCellStyle = workbook.createCellStyle();
            doubleCellStyle.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("0.00"));

            int rowIdx = 1;
            for (Venta v : ventas) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);

                // ID
                row.createCell(0).setCellValue(v.getId());

                // Cliente
                String cliente = v.getUsuario() != null ? v.getUsuario().getNombre() + " " + v.getUsuario().getApellido() : "Anónimo";
                row.createCell(1).setCellValue(cliente);

                // Fecha
                org.apache.poi.ss.usermodel.Cell dateCell = row.createCell(2);
                if (v.getFechaVenta() != null) {
                    dateCell.setCellValue(java.util.Date.from(v.getFechaVenta().toInstant()));
                    dateCell.setCellStyle(dateCellStyle);
                }

                // Total
                org.apache.poi.ss.usermodel.Cell totalCell = row.createCell(3);
                totalCell.setCellValue(v.getTotal() != null ? v.getTotal().doubleValue() : 0.0);
                totalCell.setCellStyle(doubleCellStyle);

                // Metodo Pago
                row.createCell(4).setCellValue(v.getMetodoPago() != null ? v.getMetodoPago() : "");

                // Tipo Comprobante
                row.createCell(5).setCellValue(v.getTipoComprobante() != null ? v.getTipoComprobante() : "");

                // Numero Comprobante
                row.createCell(6).setCellValue(v.getNumeroComprobante() != null ? v.getNumeroComprobante() : "");

                // Delivery
                row.createCell(7).setCellValue(v.getEsDelivery() != null && v.getEsDelivery() ? "Sí" : "No");

                // Direccion
                row.createCell(8).setCellValue(v.getDireccionEntrega() != null ? v.getDireccionEntrega() : "");

                // Estado
                row.createCell(9).setCellValue(v.getEstadoVenta() != null ? v.getEstadoVenta().getDbValue() : "");
            }

            // Auto-ajustar tamaño de columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error al exportar ventas a Excel", e);
            throw new RuntimeException("Error al generar archivo Excel", e);
        }
    }

    private List<Venta> getVentasPorFecha(java.time.LocalDate fecha) {
        if (fecha == null) {
            return repository.findAll();
        }
        java.time.OffsetDateTime start = fecha.atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        java.time.OffsetDateTime end = fecha.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        return ((VentaRepository) repository).findVentasByFecha(start, end);
    }
}
