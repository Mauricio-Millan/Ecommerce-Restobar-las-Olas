package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Rol;
import org.example.backendrestobarlasolas.service.RolService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
public class RolController extends AbstractCrudController<Rol, Integer> {

    public RolController(RolService service) {
        super(service);
    }

    @Override
    protected void setId(Rol entity, Integer id) {
        entity.setId(id);
    }
}

