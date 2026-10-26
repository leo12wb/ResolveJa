package io.fixfirst.resolveja.dto.agendamento;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record AgendamentoRequest(
    UUID clienteId,

    @NotNull(message = "Data e hora são obrigatórias")
    Instant dataHora,

    @Min(value = 15, message = "Duração mínima é 15 minutos")
    int duracaoMin,

    String descricao
) {}
