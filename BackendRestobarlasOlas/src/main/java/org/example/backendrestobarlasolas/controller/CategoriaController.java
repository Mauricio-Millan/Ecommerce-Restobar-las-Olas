package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Categoria;
import org.example.backendrestobarlasolas.service.CategoriaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController extends AbstractCrudController<Categoria, Integer> {

    public CategoriaController(CategoriaService service) {
        super(service);
    }

    @Override
    protected void setId(Categoria entity, Integer id) {
        entity.setId(id);
    }
}

