package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Usuario;
import org.example.backendrestobarlasolas.repository.UsuarioRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.UsuarioService;
import org.springframework.stereotype.Service;

@Service
public class UsuarioServiceImpl extends AbstractJpaCrudService<Usuario, java.util.UUID> implements UsuarioService {

    public UsuarioServiceImpl(UsuarioRepository repository) {
        super(repository);
    }
}

