package io.fixfirst.resolveja.repository;

import io.fixfirst.resolveja.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgendamentoRepository extends JpaRepository<Agendamento, UUID> {

    @Query(value = """
        SELECT * FROM agendamento a
        WHERE a.prestador_id = CAST(:prestadorId AS uuid)
          AND (CAST(:inicio AS timestamptz) IS NULL OR a.data_hora >= CAST(:inicio AS timestamptz))
          AND (CAST(:fim AS timestamptz) IS NULL OR a.data_hora <= CAST(:fim AS timestamptz))
        ORDER BY a.data_hora ASC
        """,
        nativeQuery = true)
    List<Agendamento> listar(
        @Param("prestadorId") UUID prestadorId,
        @Param("inicio") Instant inicio,
        @Param("fim") Instant fim);

    Optional<Agendamento> findByIdAndPrestadorId(UUID id, UUID prestadorId);

    long countByPrestadorId(UUID prestadorId);

    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.prestador.id = :prestadorId
          AND a.status = :status
          AND a.dataHora >= :agora
        ORDER BY a.dataHora ASC
        """)
    List<Agendamento> findProximos(
        @Param("prestadorId") UUID prestadorId,
        @Param("status") Agendamento.Status status,
        @Param("agora") Instant agora,
        org.springframework.data.domain.Pageable pageable);
}
