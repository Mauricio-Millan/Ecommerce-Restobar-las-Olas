package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Rol;
import org.example.backendrestobarlasolas.repository.RolRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.RolService;
import org.springframework.stereotype.Service;

@Service
public class RolServiceImpl extends AbstractJpaCrudService<Rol, Integer> implements RolService {

    public RolServiceImpl(RolRepository repository) {
        super(repository);
    }
}

