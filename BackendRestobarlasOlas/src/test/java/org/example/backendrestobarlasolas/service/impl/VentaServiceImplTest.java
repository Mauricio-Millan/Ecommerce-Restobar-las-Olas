package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Agregado;
import org.example.backendrestobarlasolas.model.DetalleVenta;
import org.example.backendrestobarlasolas.model.DetalleVentaAgregado;
import org.example.backendrestobarlasolas.model.Plato;
import org.example.backendrestobarlasolas.model.Venta;
import org.example.backendrestobarlasolas.repository.AgregadoRepository;
import org.example.backendrestobarlasolas.repository.PlatoRepository;
import org.example.backendrestobarlasolas.repository.VentaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VentaServiceImplTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private PlatoRepository platoRepository;

    @Mock
    private AgregadoRepository agregadoRepository;

    @InjectMocks
    private VentaServiceImpl ventaService;

    @Test
    void save_debeCalcularTotalIncluyendoAgregadosPorCantidadYPersistirHistoricos() {
        Plato platoInput = Plato.builder().id(10).build();
        Agregado agregadoInput = Agregado.builder().id(20).build();

        DetalleVentaAgregado detalleAgregado = DetalleVentaAgregado.builder()
                .agregado(agregadoInput)
                .build();

        DetalleVenta detalle = DetalleVenta.builder()
                .plato(platoInput)
                .cantidad(2)
                .detalleVentaAgregados(List.of(detalleAgregado))
                .build();

        Venta venta = Venta.builder()
                .detalles(List.of(detalle))
                .build();

        when(platoRepository.findById(10)).thenReturn(Optional.of(Plato.builder().id(10).precio(new BigDecimal("20.00")).build()));
        when(agregadoRepository.findById(20)).thenReturn(Optional.of(Agregado.builder().id(20).precio(new BigDecimal("3.50")).build()));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Venta guardada = ventaService.save(venta);

        assertEquals(new BigDecimal("47.00"), guardada.getTotal());
        assertEquals(new BigDecimal("20.00"), detalle.getPrecioUnitarioHistorico());
        assertEquals(new BigDecimal("3.50"), detalleAgregado.getPrecioExtraHistorico());
        assertSame(detalle, detalleAgregado.getDetalleVenta());
    }

    @Test
    void save_debeRechazarDetalleConCantidadInvalida() {
        DetalleVenta detalle = DetalleVenta.builder()
                .cantidad(0)
                .precioUnitarioHistorico(new BigDecimal("10.00"))
                .build();

        Venta venta = Venta.builder()
                .detalles(List.of(detalle))
                .build();

        assertThrows(IllegalArgumentException.class, () -> ventaService.save(venta));
    }

    @Test
    void save_debeConstruirYRegistrarAgregadosSiLleganComoIdsPlanos() {
        DetalleVenta detalle = DetalleVenta.builder()
                .platoId(7)
                .cantidad(3)
                .agregadosIds(List.of(1, 2))
                .build();

        Venta venta = Venta.builder()
                .detalles(List.of(detalle))
                .build();

        when(platoRepository.findById(7)).thenReturn(Optional.of(Plato.builder().id(7).precio(new BigDecimal("15.00")).build()));
        when(agregadoRepository.findById(1)).thenReturn(Optional.of(Agregado.builder().id(1).precio(new BigDecimal("1.00")).build()));
        when(agregadoRepository.findById(2)).thenReturn(Optional.of(Agregado.builder().id(2).precio(new BigDecimal("2.50")).build()));
        when(ventaRepository.save(any(Venta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Venta guardada = ventaService.save(venta);

        assertEquals(new BigDecimal("55.50"), guardada.getTotal());
        assertEquals(2, detalle.getDetalleVentaAgregados().size());
        assertSame(detalle, detalle.getDetalleVentaAgregados().get(0).getDetalleVenta());
        assertEquals(new BigDecimal("1.00"), detalle.getDetalleVentaAgregados().get(0).getPrecioExtraHistorico());
        assertEquals(new BigDecimal("2.50"), detalle.getDetalleVentaAgregados().get(1).getPrecioExtraHistorico());
    }
}

