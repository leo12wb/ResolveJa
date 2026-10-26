package io.fixfirst.resolveja.repository;

import io.fixfirst.resolveja.model.Servico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServicoRepository extends JpaRepository<Servico, UUID> {

    @Query("""
        SELECT s FROM Servico s
        WHERE s.prestador.id = :prestadorId
          AND (:status IS NULL OR s.status = :status)
          AND (:clienteId IS NULL OR s.cliente.id = :clienteId)
          AND (:inicio IS NULL OR s.dataServico >= :inicio)
          AND (:fim IS NULL OR s.dataServico <= :fim)
        ORDER BY s.criadoEm DESC
        """)
    Page<Servico> filtrar(
            @Param("prestadorId") UUID prestadorId,
            @Param("status") Servico.Status status,
            @Param("clienteId") UUID clienteId,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim,
            Pageable pageable);

    Optional<Servico> findByIdAndPrestadorId(UUID id, UUID prestadorId);

    List<Servico> findByClienteIdAndPrestadorId(UUID clienteId, UUID prestadorId);

    long countByPrestadorIdAndStatus(UUID prestadorId, Servico.Status status);

    @Query("""
        SELECT COALESCE(SUM(s.valor), 0) FROM Servico s
        WHERE s.prestador.id = :prestadorId
          AND s.status = :status
          AND s.pago = true
          AND s.dataConclusao >= :inicio
          AND s.dataConclusao < :fim
        """)
    java.math.BigDecimal somarReceitasRange(
            @Param("prestadorId") UUID prestadorId,
            @Param("status") Servico.Status status,
            @Param("inicio") Instant inicio,
            @Param("fim") Instant fim);

    @Query("""
        SELECT COUNT(s) FROM Servico s
        WHERE s.prestador.id = :prestadorId
          AND s.status = :status
          AND s.dataConclusao >= :inicio
          AND s.dataConclusao < :fim
        """)
    long countConcluidosRange(
            @Param("prestadorId") UUID prestadorId,
            @Param("status") Servico.Status status,
            @Param("inicio") Instant inicio,
            @Param("fim") Instant fim);

    @Query("""
        SELECT COALESCE(SUM(s.valor), 0) FROM Servico s
        WHERE s.prestador.id = :prestadorId
          AND s.pago = false
          AND s.status = :status
        """)
    java.math.BigDecimal somarAReceber(
            @Param("prestadorId") UUID prestadorId,
            @Param("status") Servico.Status status);
}
