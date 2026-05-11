package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.DetalleVenta;
import org.example.backendrestobarlasolas.service.DetalleVentaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/detalles-venta")
public class DetalleVentaController extends AbstractCrudController<DetalleVenta, Integer> {

    public DetalleVentaController(DetalleVentaService service) {
        super(service);
    }

    @Override
    protected void setId(DetalleVenta entity, Integer id) {
        entity.setId(id);
    }
}

