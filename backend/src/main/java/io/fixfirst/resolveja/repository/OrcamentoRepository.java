package io.fixfirst.resolveja.repository;

import io.fixfirst.resolveja.model.Orcamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrcamentoRepository extends JpaRepository<Orcamento, UUID> {

    @Query("""
        SELECT o FROM Orcamento o
        WHERE o.prestador.id = :prestadorId
          AND (:status IS NULL OR o.status = :status)
        """)
    Page<Orcamento> listar(
        @Param("prestadorId") UUID prestadorId,
        @Param("status") Orcamento.Status status,
        Pageable pageable);

    Optional<Orcamento> findByIdAndPrestadorId(UUID id, UUID prestadorId);

    Optional<Orcamento> findByTokenPublico(String tokenPublico);

    boolean existsByTokenPublico(String tokenPublico);
}
