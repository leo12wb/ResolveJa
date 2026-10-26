package io.fixfirst.resolveja.repository;

import io.fixfirst.resolveja.model.TokenRecuperacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenRecuperacaoRepository extends JpaRepository<TokenRecuperacao, UUID> {

    Optional<TokenRecuperacao> findByTokenAndUsadoFalse(String token);

    @Modifying
    @Query("DELETE FROM TokenRecuperacao t WHERE t.expiraEm < :agora OR t.usado = true")
    void deleteExpiradosEUsados(Instant agora);
}
