package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.PlatoAgregados;
import org.example.backendrestobarlasolas.model.PlatoAgregadosId;
import org.example.backendrestobarlasolas.service.PlatoAgregadosService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plato-agregados")
public class PlatoAgregadosController extends AbstractCrudController<PlatoAgregados, PlatoAgregadosId> {

    public PlatoAgregadosController(PlatoAgregadosService service) {
        super(service);
    }

    @Override
    protected void setId(PlatoAgregados entity, PlatoAgregadosId id) {
        entity.setId(id);
    }
}

