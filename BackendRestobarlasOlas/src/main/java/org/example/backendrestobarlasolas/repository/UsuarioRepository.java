package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
}

