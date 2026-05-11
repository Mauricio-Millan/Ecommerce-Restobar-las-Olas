package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.DetalleVentaAgregado;
import org.example.backendrestobarlasolas.repository.DetalleVentaAgregadoRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.DetalleVentaAgregadoService;
import org.springframework.stereotype.Service;

@Service
public class DetalleVentaAgregadoServiceImpl extends AbstractJpaCrudService<DetalleVentaAgregado, Integer> implements DetalleVentaAgregadoService {

    public DetalleVentaAgregadoServiceImpl(DetalleVentaAgregadoRepository repository) {
        super(repository);
    }
}

