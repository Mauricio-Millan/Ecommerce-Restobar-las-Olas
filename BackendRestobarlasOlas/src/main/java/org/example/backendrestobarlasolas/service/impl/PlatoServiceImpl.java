package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Plato;
import org.example.backendrestobarlasolas.repository.PlatoRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.PlatoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PlatoServiceImpl extends AbstractJpaCrudService<Plato, Integer> implements PlatoService {

    private final PlatoRepository repository;

    public PlatoServiceImpl(PlatoRepository repository) {
        super(repository);
        this.repository = repository;
    }

    @Override
    public List<Plato> findByCategoriaId(Integer categoriaId) {
        return repository.findByCategoria_Id(categoriaId);
    }

    @Override
    public List<Plato> findActivos() {
        return repository.findByActivoTrue();
    }

    @Override
    public List<Plato> findActivosByCategoria(Integer categoriaId) {
        return repository.findByCategoria_IdAndActivoTrue(categoriaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Plato> findAllWithCategoria() {
        return repository.findAllWithCategoria();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Plato> findByIdWithCategoria(Integer id) {
        return repository.findByIdWithCategoria(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Plato> findByCategoriaIdWithCategoria(Integer categoriaId) {
        return repository.findByCategoriaIdWithCategoria(categoriaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Plato> findActivosWithCategoria() {
        return repository.findActivosWithCategoria();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Plato> findActivosByCategoriaWithCategoria(Integer categoriaId) {
        return repository.findActivosByCategoriaWithCategoria(categoriaId);
    }
}
