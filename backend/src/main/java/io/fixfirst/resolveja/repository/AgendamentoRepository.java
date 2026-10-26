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

    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.prestador.id = :prestadorId
          AND (:inicio IS NULL OR a.dataHora >= :inicio)
          AND (:fim IS NULL OR a.dataHora <= :fim)
        ORDER BY a.dataHora ASC
        """)
    List<Agendamento> listar(
        @Param("prestadorId") UUID prestadorId,
        @Param("inicio") Instant inicio,
        @Param("fim") Instant fim);

    Optional<Agendamento> findByIdAndPrestadorId(UUID id, UUID prestadorId);

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
