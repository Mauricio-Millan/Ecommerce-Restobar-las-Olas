package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Integer> {

    Optional<Rol> findByRolIgnoreCase(String rol);
}
