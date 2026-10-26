package io.fixfirst.resolveja.dto.orcamento;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record OrcamentoRequest(
    UUID clienteId,
    @Min(1) int validadeDias,
    String observacoes,
    @NotEmpty @Valid List<OrcamentoItemRequest> itens
) {}
