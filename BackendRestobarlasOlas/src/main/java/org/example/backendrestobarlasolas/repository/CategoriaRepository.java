package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}

