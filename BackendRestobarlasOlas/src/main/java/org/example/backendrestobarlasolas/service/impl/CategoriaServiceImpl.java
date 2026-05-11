package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.Categoria;
import org.example.backendrestobarlasolas.repository.CategoriaRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.CategoriaService;
import org.springframework.stereotype.Service;

@Service
public class CategoriaServiceImpl extends AbstractJpaCrudService<Categoria, Integer> implements CategoriaService {

    public CategoriaServiceImpl(CategoriaRepository repository) {
        super(repository);
    }
}

