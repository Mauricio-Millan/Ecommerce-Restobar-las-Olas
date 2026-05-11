package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Venta;
import org.example.backendrestobarlasolas.service.VentaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ventas")
public class VentaController extends AbstractCrudController<Venta, Integer> {

    public VentaController(VentaService service) {
        super(service);
    }

    @Override
    protected void setId(Venta entity, Integer id) {
        entity.setId(id);
    }
}

