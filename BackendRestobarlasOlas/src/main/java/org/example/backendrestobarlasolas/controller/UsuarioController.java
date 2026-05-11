package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Usuario;
import org.example.backendrestobarlasolas.service.UsuarioService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController extends AbstractCrudController<Usuario, UUID> {

    public UsuarioController(UsuarioService service) {
        super(service);
    }

    @Override
    protected void setId(Usuario entity, UUID id) {
        entity.setId(id);
    }
}

