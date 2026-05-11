package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Plato;
import org.example.backendrestobarlasolas.repository.PlatoRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.PlatoService;
import org.springframework.stereotype.Service;

@Service
public class PlatoServiceImpl extends AbstractJpaCrudService<Plato, Integer> implements PlatoService {

    public PlatoServiceImpl(PlatoRepository repository) {
        super(repository);
    }
}

