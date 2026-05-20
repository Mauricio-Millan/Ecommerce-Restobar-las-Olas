package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.dto.catalog.PlatoCatalogDto;
import org.example.backendrestobarlasolas.model.Categoria;
import org.example.backendrestobarlasolas.model.Plato;
import org.example.backendrestobarlasolas.service.PlatoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/platos")
public class PlatoController {

    private final PlatoService platoService;

    public PlatoController(PlatoService service) {
        this.platoService = service;
    }

    @GetMapping
    public List<PlatoCatalogDto> findAll() {
        return platoService.findAllWithCategoria().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlatoCatalogDto> findById(@PathVariable("id") Integer id) {
        return platoService.findByIdWithCategoria(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PlatoCatalogDto> create(@RequestBody Plato entity) {
        Plato savedPlato = platoService.save(entity);
        return platoService.findByIdWithCategoria(savedPlato.getId())
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlatoCatalogDto> update(@PathVariable("id") Integer id, @RequestBody Plato entity) {
        entity.setId(id);
        Plato savedPlato = platoService.save(entity);
        return platoService.findByIdWithCategoria(savedPlato.getId())
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        platoService.deleteById(id);
        return ResponseEntity.noContent().build();
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
