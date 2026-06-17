package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Usuario;
import org.example.backendrestobarlasolas.repository.RolRepository;
import org.example.backendrestobarlasolas.repository.UsuarioRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.UsuarioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UsuarioServiceImpl extends AbstractJpaCrudService<Usuario, UUID> implements UsuarioService {

    private final RolRepository rolRepository;

    public UsuarioServiceImpl(UsuarioRepository repository, RolRepository rolRepository) {
        super(repository);
        this.rolRepository = rolRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Usuario> searchAccounts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return repository.findAll();
        }
        return ((UsuarioRepository) repository).searchByDniOrName(query.trim());
    }

    @Override
    @Transactional
    public Usuario changeStatus(UUID userId, boolean activo) {
        Usuario usuario = repository.findById(userId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Usuario no encontrado"));
        usuario.setActivo(activo);
        return repository.save(usuario);
    }

    @Override
    @Transactional
    public Usuario assignRole(UUID userId, Integer rolId) {
        Usuario usuario = repository.findById(userId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Usuario no encontrado"));
        if (rolId == null) {
            usuario.setRol(null);
        } else {
            org.example.backendrestobarlasolas.model.Rol rol = rolRepository.findById(rolId)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Rol no encontrado con ID: " + rolId));
            usuario.setRol(rol);
        }
        return repository.save(usuario);
    }
}

