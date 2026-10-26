package io.fixfirst.resolveja.dto.cliente;

import io.fixfirst.resolveja.model.Cliente;

import java.time.Instant;
import java.util.UUID;

public record ClienteResponse(
    UUID id,
    String nome,
    String telefone,
    String email,
    String endereco,
    String observacoes,
    Boolean ativo,
    Instant criadoEm,
    Instant atualizadoEm
) {
    public static ClienteResponse from(Cliente c) {
        return new ClienteResponse(
            c.getId(), c.getNome(), c.getTelefone(), c.getEmail(),
            c.getEndereco(), c.getObservacoes(), c.getAtivo(),
            c.getCriadoEm(), c.getAtualizadoEm()
        );
    }
}
