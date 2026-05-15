package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Agregado;
import org.example.backendrestobarlasolas.model.PlatoAgregados;
import org.example.backendrestobarlasolas.model.PlatoAgregadosId;
import org.example.backendrestobarlasolas.service.PlatoAgregadosService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/plato-agregados")
public class PlatoAgregadosController extends AbstractCrudController<PlatoAgregados, PlatoAgregadosId> {

    private final PlatoAgregadosService platoAgregadosService;

    public PlatoAgregadosController(PlatoAgregadosService service) {
        super(service);
        this.platoAgregadosService = service;
    }

    @Override
    protected void setId(PlatoAgregados entity, PlatoAgregadosId id) {
        entity.setId(id);
    }

    @GetMapping("/plato/{platoId}")
    public List<PlatoAgregados> findByPlato(@PathVariable Integer platoId) {
        return platoAgregadosService.findByPlatoId(platoId);
    }

    @GetMapping("/plato/{platoId}/agregados")
    public List<Agregado> findAgregadosByPlato(@PathVariable Integer platoId) {
        return platoAgregadosService.findAgregadosByPlatoId(platoId);
    }
}
