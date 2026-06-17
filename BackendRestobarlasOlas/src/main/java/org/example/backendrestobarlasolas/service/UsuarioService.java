package org.example.backendrestobarlasolas.service;

import org.example.backendrestobarlasolas.model.Usuario;

import java.util.UUID;
import java.util.List;

public interface UsuarioService extends CrudService<Usuario, UUID> {
    List<Usuario> searchAccounts(String query);
    Usuario changeStatus(UUID userId, boolean activo);
    Usuario assignRole(UUID userId, Integer rolId);
}

