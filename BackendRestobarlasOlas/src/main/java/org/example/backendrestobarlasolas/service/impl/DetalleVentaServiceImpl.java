package org.example.backendrestobarlasolas.service.impl;

import org.example.backendrestobarlasolas.model.DetalleVenta;
import org.example.backendrestobarlasolas.repository.DetalleVentaRepository;
import org.example.backendrestobarlasolas.service.AbstractJpaCrudService;
import org.example.backendrestobarlasolas.service.DetalleVentaService;
import org.springframework.stereotype.Service;

@Service
public class DetalleVentaServiceImpl extends AbstractJpaCrudService<DetalleVenta, Integer> implements DetalleVentaService {

    public DetalleVentaServiceImpl(DetalleVentaRepository repository) {
        super(repository);
    }
}

