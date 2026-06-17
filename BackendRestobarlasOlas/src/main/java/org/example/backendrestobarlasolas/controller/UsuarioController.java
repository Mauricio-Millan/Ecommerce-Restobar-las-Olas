package org.example.backendrestobarlasolas.controller;

import org.example.backendrestobarlasolas.model.Usuario;
import org.example.backendrestobarlasolas.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController extends AbstractCrudController<Usuario, UUID> {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService service) {
        super(service);
        this.usuarioService = service;
    }

    @Override
    protected void setId(Usuario entity, UUID id) {
        entity.setId(id);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Usuario>> buscarCuentas(@RequestParam(name = "query", required = false) String query) {
        return ResponseEntity.ok(usuarioService.searchAccounts(query));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Usuario> cambiarEstado(@PathVariable("id") UUID id, @RequestParam("activo") boolean activo) {
        try {
            return ResponseEntity.ok(usuarioService.changeStatus(id, activo));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<Usuario> asignarRol(@PathVariable("id") UUID id, @RequestParam(name = "rolId", required = false) Integer rolId) {
        try {
            return ResponseEntity.ok(usuarioService.assignRole(id, rolId));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

