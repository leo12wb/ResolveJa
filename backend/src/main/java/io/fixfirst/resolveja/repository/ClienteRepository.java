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

    @Query(value = """
        SELECT * FROM cliente c
        WHERE c.prestador_id = CAST(:prestadorId AS uuid)
          AND c.ativo = true
          AND (CAST(:q AS text) IS NULL
               OR LOWER(c.nome) LIKE LOWER(CONCAT('%', CAST(:q AS text), '%'))
               OR c.telefone LIKE CONCAT('%', CAST(:q AS text), '%'))
        ORDER BY c.nome
        """,
        countQuery = """
        SELECT COUNT(*) FROM cliente c
        WHERE c.prestador_id = CAST(:prestadorId AS uuid)
          AND c.ativo = true
          AND (CAST(:q AS text) IS NULL
               OR LOWER(c.nome) LIKE LOWER(CONCAT('%', CAST(:q AS text), '%'))
               OR c.telefone LIKE CONCAT('%', CAST(:q AS text), '%'))
        """,
        nativeQuery = true)
    Page<Cliente> buscar(
            @Param("prestadorId") UUID prestadorId,
            @Param("q") String q,
            Pageable pageable);

    Optional<Cliente> findByIdAndPrestadorId(UUID id, UUID prestadorId);

    long countByPrestadorIdAndAtivoTrue(UUID prestadorId);
}
