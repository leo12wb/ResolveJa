package io.fixfirst.resolveja.dto.servico;

import io.fixfirst.resolveja.model.Servico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ServicoRequest(

    @NotNull(message = "Cliente é obrigatório")
    UUID clienteId,

    @NotBlank(message = "Descrição é obrigatória")
    String descricao,

    Servico.Status status,

    BigDecimal valor,

    Boolean pago,

    LocalDate dataServico,

    String observacoes
) {}
