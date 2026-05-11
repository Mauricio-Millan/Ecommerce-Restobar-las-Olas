package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.PlatoAgregados;
import org.example.backendrestobarlasolas.model.PlatoAgregadosId;
import org.example.backendrestobarlasolas.repository.PlatoAgregadosRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.PlatoAgregadosService;
import org.springframework.stereotype.Service;

@Service
public class PlatoAgregadosServiceImpl extends AbstractJpaCrudService<PlatoAgregados, PlatoAgregadosId> implements PlatoAgregadosService {

    public PlatoAgregadosServiceImpl(PlatoAgregadosRepository repository) {
        super(repository);
    }
}

