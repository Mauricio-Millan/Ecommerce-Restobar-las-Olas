package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    Optional<Usuario> findByDni(String dni);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByDni(String dni);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.rol WHERE " +
           "u.dni LIKE %:query% OR " +
           "LOWER(CONCAT(u.nombre, ' ', u.apellido)) LIKE LOWER(CONCAT('%', :query, '%'))")
    java.util.List<Usuario> searchByDniOrName(String query);
}
