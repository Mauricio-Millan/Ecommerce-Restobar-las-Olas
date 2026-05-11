package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Plato;
import org.example.backendrestobarlasolas.service.PlatoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platos")
public class PlatoController extends AbstractCrudController<Plato, Integer> {

    public PlatoController(PlatoService service) {
        super(service);
    }

    @Override
    protected void setId(Plato entity, Integer id) {
        entity.setId(id);
    }
}

