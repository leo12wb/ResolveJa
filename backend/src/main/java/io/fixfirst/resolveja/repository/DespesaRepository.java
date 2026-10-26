package io.fixfirst.resolveja.repository;

import io.fixfirst.resolveja.model.Despesa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface DespesaRepository extends JpaRepository<Despesa, UUID> {

    @Query("""
        SELECT d FROM Despesa d
        WHERE d.prestador.id = :prestadorId
          AND (:inicio IS NULL OR d.dataDespesa >= :inicio)
          AND (:fim IS NULL OR d.dataDespesa <= :fim)
        ORDER BY d.dataDespesa DESC, d.criadoEm DESC
        """)
    Page<Despesa> listar(
        @Param("prestadorId") UUID prestadorId,
        @Param("inicio") LocalDate inicio,
        @Param("fim") LocalDate fim,
        Pageable pageable);

    Optional<Despesa> findByIdAndPrestadorId(UUID id, UUID prestadorId);

    @Query("""
        SELECT COALESCE(SUM(d.valor), 0) FROM Despesa d
        WHERE d.prestador.id = :prestadorId
          AND d.dataDespesa >= :inicio
          AND d.dataDespesa <= :fim
        """)
    BigDecimal somarDespesasRange(
        @Param("prestadorId") UUID prestadorId,
        @Param("inicio") LocalDate inicio,
        @Param("fim") LocalDate fim);
}
