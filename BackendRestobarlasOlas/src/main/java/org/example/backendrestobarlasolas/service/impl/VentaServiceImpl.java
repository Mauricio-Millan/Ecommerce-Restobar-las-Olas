package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.DetalleVenta;
import org.example.backendrestobarlasolas.model.DetalleVentaAgregado;
import org.example.backendrestobarlasolas.model.Venta;
import org.example.backendrestobarlasolas.repository.VentaRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.VentaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class VentaServiceImpl extends AbstractJpaCrudService<Venta, Integer> implements VentaService {

    public VentaServiceImpl(VentaRepository repository) {
        super(repository);
    }

    @Override
    @Transactional
    public Venta save(Venta venta) {
        prepararRelaciones(venta);
        venta.setTotal(calcularTotal(venta));
        return repository.save(venta);
    }

    private void prepararRelaciones(Venta venta) {
        if (venta.getDetalles() == null) {
            return;
        }

        for (DetalleVenta detalle : venta.getDetalles()) {
            detalle.setVenta(venta);
            if (detalle.getDetalleVentaAgregados() == null) {
                continue;
            }
            for (DetalleVentaAgregado agregadoSeleccionado : detalle.getDetalleVentaAgregados()) {
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
            BigDecimal precioUnitario = detalle.getPrecioUnitarioHistorico();
            if (precioUnitario == null && detalle.getPlato() != null) {
                precioUnitario = detalle.getPlato().getPrecio();
            }
            if (precioUnitario == null) {
                precioUnitario = BigDecimal.ZERO;
            }

            int cantidad = detalle.getCantidad() != null ? detalle.getCantidad() : 0;
            BigDecimal subtotalDetalle = precioUnitario.multiply(BigDecimal.valueOf(cantidad));

            BigDecimal extras = BigDecimal.ZERO;
            if (detalle.getDetalleVentaAgregados() != null) {
                for (DetalleVentaAgregado seleccionado : detalle.getDetalleVentaAgregados()) {
                    if (seleccionado.getPrecioExtraHistorico() != null) {
                        extras = extras.add(seleccionado.getPrecioExtraHistorico());
                    }
                }
            }

            total = total.add(subtotalDetalle.add(extras));
        }

        return total;
    }
}

