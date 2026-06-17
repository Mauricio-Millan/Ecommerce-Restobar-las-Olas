package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.DetalleVenta;
import org.example.backendrestobarlasolas.model.Plato;
import org.example.backendrestobarlasolas.model.Venta;
import org.example.backendrestobarlasolas.model.VentaEstado;
import org.example.backendrestobarlasolas.repository.PlatoRepository;
import org.example.backendrestobarlasolas.repository.VentaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class VentasReportesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PlatoRepository platoRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Test
    void testGetPlatosMasVendidos() throws Exception {
        // 1. Crear y guardar platos
        Plato plato1 = platoRepository.save(Plato.builder().nombre("Ceviche").precio(new BigDecimal("25.00")).activo(true).build());
        Plato plato2 = platoRepository.save(Plato.builder().nombre("Lomo Saltado").precio(new BigDecimal("35.00")).activo(true).build());

        // 2. Crear y guardar venta con detalles
        Venta venta = Venta.builder()
                .total(new BigDecimal("120.00"))
                .estadoVenta(VentaEstado.ENTREGADO)
                .fechaVenta(OffsetDateTime.now())
                .build();

        DetalleVenta d1 = DetalleVenta.builder()
                .plato(plato1)
                .cantidad(3)
                .precioUnitarioHistorico(new BigDecimal("25.00"))
                .venta(venta)
                .build();

        DetalleVenta d2 = DetalleVenta.builder()
                .plato(plato2)
                .cantidad(2)
                .precioUnitarioHistorico(new BigDecimal("35.00"))
                .venta(venta)
                .build();

        venta.setDetalles(List.of(d1, d2));
        ventaRepository.save(venta);

        // 3. Consultar platos más vendidos
        mockMvc.perform(get("/api/ventas/reportes/platos-mas-vendidos")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].platoNombre").value("Ceviche"))
                .andExpect(jsonPath("$[0].cantidad").value(3))
                .andExpect(jsonPath("$[1].platoNombre").value("Lomo Saltado"))
                .andExpect(jsonPath("$[1].cantidad").value(2));
    }

    @Test
    void testExportarCsv() throws Exception {
        mockMvc.perform(get("/api/ventas/exportar/csv")
                        .param("fecha", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("reporte-ventas-")))
                .andExpect(content().contentType("text/csv; charset=UTF-8"));
    }

    @Test
    void testExportarExcel() throws Exception {
        mockMvc.perform(get("/api/ventas/exportar/excel")
                        .param("fecha", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("reporte-ventas-")))
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }
}
