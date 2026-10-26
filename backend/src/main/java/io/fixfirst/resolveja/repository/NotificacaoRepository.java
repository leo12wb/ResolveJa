package io.fixfirst.resolveja.repository;

import io.fixfirst.resolveja.model.Notificacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {

    Page<Notificacao> findByPrestadorIdOrderByCriadoEmDesc(UUID prestadorId, Pageable pageable);

    long countByPrestadorIdAndLidaFalse(UUID prestadorId);

    Optional<Notificacao> findByIdAndPrestadorId(UUID id, UUID prestadorId);

    @Modifying
    @Query("UPDATE Notificacao n SET n.lida = true WHERE n.prestador.id = :prestadorId AND n.lida = false")
    int marcarTodasLidas(@Param("prestadorId") UUID prestadorId);
}
