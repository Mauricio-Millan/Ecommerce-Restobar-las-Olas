package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Agregado;
import org.example.backendrestobarlasolas.model.PlatoAgregados;
import org.example.backendrestobarlasolas.model.PlatoAgregadosId;
import org.example.backendrestobarlasolas.repository.PlatoAgregadosRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.PlatoAgregadosService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlatoAgregadosServiceImpl extends AbstractJpaCrudService<PlatoAgregados, PlatoAgregadosId> implements PlatoAgregadosService {

    private final PlatoAgregadosRepository repository;

    public PlatoAgregadosServiceImpl(PlatoAgregadosRepository repository) {
        super(repository);
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlatoAgregados> findByPlatoId(Integer platoId) {
        return repository.findByPlato_Id(platoId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Agregado> findAgregadosByPlatoId(Integer platoId) {
        return repository.findByPlato_Id(platoId)
                .stream()
                .map(PlatoAgregados::getAgregado)
                .toList();
    }
}
