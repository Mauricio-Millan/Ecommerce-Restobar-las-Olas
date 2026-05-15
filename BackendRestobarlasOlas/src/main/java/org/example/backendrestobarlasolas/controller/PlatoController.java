package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.dto.catalog.PlatoCatalogDto;
import org.example.backendrestobarlasolas.model.Categoria;
import org.example.backendrestobarlasolas.model.Plato;
import org.example.backendrestobarlasolas.service.PlatoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/platos")
public class PlatoController extends AbstractCrudController<Plato, Integer> {

    private final PlatoService platoService;

    public PlatoController(PlatoService service) {
        super(service);
        this.platoService = service;
    }

    @Override
    protected void setId(Plato entity, Integer id) {
        entity.setId(id);
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<PlatoCatalogDto> findByCategoria(@PathVariable Integer categoriaId) {
        return platoService.findByCategoriaIdWithCategoria(categoriaId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/activos")
    public List<PlatoCatalogDto> findActivos(@RequestParam(name = "categoriaId", required = false) Integer categoriaId) {
        List<Plato> platos = categoriaId == null
                ? platoService.findActivosWithCategoria()
                : platoService.findActivosByCategoriaWithCategoria(categoriaId);
        return platos.stream().map(this::toDto).toList();
    }

    private PlatoCatalogDto toDto(Plato plato) {
        Categoria categoria = plato.getCategoria();
        return new PlatoCatalogDto(
                plato.getId(),
                categoria != null ? categoria.getId() : null,
                categoria != null ? categoria.getNombre() : null,
                plato.getNombre(),
                plato.getDescripcion(),
                plato.getPrecio(),
                plato.getUrlImagen(),
                plato.getActivo()
        );
    }
}
