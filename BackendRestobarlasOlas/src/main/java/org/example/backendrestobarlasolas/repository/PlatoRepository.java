package org.example.backendrestobarlasolas.repository;

import org.example.backendrestobarlasolas.model.Plato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PlatoRepository extends JpaRepository<Plato, Integer> {

    List<Plato> findByCategoria_Id(Integer categoriaId);

    List<Plato> findByActivoTrue();

    List<Plato> findByCategoria_IdAndActivoTrue(Integer categoriaId);

    @Query("select p from Plato p left join fetch p.categoria")
    List<Plato> findAllWithCategoria();

    @Query("select p from Plato p left join fetch p.categoria where p.id = :id")
    Optional<Plato> findByIdWithCategoria(Integer id);

    @Query("select p from Plato p left join fetch p.categoria where p.categoria.id = :categoriaId")
    List<Plato> findByCategoriaIdWithCategoria(Integer categoriaId);

    @Query("select p from Plato p left join fetch p.categoria where p.activo = true")
    List<Plato> findActivosWithCategoria();

    @Query("select p from Plato p left join fetch p.categoria where p.activo = true and p.categoria.id = :categoriaId")
    List<Plato> findActivosByCategoriaWithCategoria(Integer categoriaId);
}
