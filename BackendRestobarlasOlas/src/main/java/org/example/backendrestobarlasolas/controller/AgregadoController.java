package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Agregado;
import org.example.backendrestobarlasolas.service.AgregadoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agregados")
public class AgregadoController extends AbstractCrudController<Agregado, Integer> {

    public AgregadoController(AgregadoService service) {
        super(service);
    }

    @Override
    protected void setId(Agregado entity, Integer id) {
        entity.setId(id);
    }
}

