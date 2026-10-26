package io.fixfirst.resolveja.repository;

import io.fixfirst.resolveja.model.Prestador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrestadorRepository extends JpaRepository<Prestador, UUID> {

    Optional<Prestador> findByEmail(String email);

    boolean existsByEmail(String email);
}
