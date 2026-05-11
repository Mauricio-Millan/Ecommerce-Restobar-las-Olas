package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.DetalleVentaAgregado;
import org.example.backendrestobarlasolas.service.DetalleVentaAgregadoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/detalles-venta-agregados")
public class DetalleVentaAgregadoController extends AbstractCrudController<DetalleVentaAgregado, Integer> {

    public DetalleVentaAgregadoController(DetalleVentaAgregadoService service) {
        super(service);
    }

    @Override
    protected void setId(DetalleVentaAgregado entity, Integer id) {
        entity.setId(id);
    }
}

