package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Agregado;
import org.example.backendrestobarlasolas.service.AgregadoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/agregados")
public class AgregadoController extends AbstractCrudController<Agregado, Integer> {

    private final AgregadoService agregadoService;

    public AgregadoController(AgregadoService service) {
        super(service);
        this.agregadoService = service;
    }

    @Override
    protected void setId(Agregado entity, Integer id) {
        entity.setId(id);
    }

    @GetMapping("/activos")
    public List<Agregado> findActivos() {
        return agregadoService.findActivos();
    }
}
