package io.fixfirst.resolveja.dto.agendamento;

import io.fixfirst.resolveja.model.Agendamento;

import java.time.Instant;
import java.util.UUID;

public record AgendamentoResponse(
    UUID id,
    UUID clienteId,
    String clienteNome,
    Instant dataHora,
    int duracaoMin,
    String descricao,
    Agendamento.Status status,
    Instant criadoEm
) {
    public static AgendamentoResponse from(Agendamento a) {
        return new AgendamentoResponse(
            a.getId(),
            a.getCliente() != null ? a.getCliente().getId() : null,
            a.getCliente() != null ? a.getCliente().getNome() : null,
            a.getDataHora(),
            a.getDuracaoMin(),
            a.getDescricao(),
            a.getStatus(),
            a.getCriadoEm()
        );
    }
}
