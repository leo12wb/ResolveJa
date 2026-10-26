package io.fixfirst.resolveja.repository;

import io.fixfirst.resolveja.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, UUID> {

    @Query("""
        SELECT c FROM Cliente c
        WHERE c.prestador.id = :prestadorId
          AND c.ativo = true
          AND (:q IS NULL OR LOWER(c.nome) LIKE LOWER(CONCAT('%', :q, '%'))
                          OR c.telefone LIKE CONCAT('%', :q, '%'))
        ORDER BY c.nome
        """)
    Page<Cliente> buscar(
            @Param("prestadorId") UUID prestadorId,
            @Param("q") String q,
            Pageable pageable);

    Optional<Cliente> findByIdAndPrestadorId(UUID id, UUID prestadorId);

    long countByPrestadorIdAndAtivoTrue(UUID prestadorId);
}
