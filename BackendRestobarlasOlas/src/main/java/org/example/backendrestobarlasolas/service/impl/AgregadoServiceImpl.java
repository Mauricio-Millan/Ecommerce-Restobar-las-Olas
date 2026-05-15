package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Agregado;
import org.example.backendrestobarlasolas.repository.AgregadoRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.AgregadoService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AgregadoServiceImpl extends AbstractJpaCrudService<Agregado, Integer> implements AgregadoService {

    private final AgregadoRepository repository;

    public AgregadoServiceImpl(AgregadoRepository repository) {
        super(repository);
        this.repository = repository;
    }

    @Override
    public List<Agregado> findActivos() {
        return repository.findByActivoTrue();
    }
}
