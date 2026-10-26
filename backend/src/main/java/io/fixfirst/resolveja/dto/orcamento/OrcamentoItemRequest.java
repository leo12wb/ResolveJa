package io.fixfirst.resolveja.dto.orcamento;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record OrcamentoItemRequest(
    @NotBlank String descricao,
    @NotNull @DecimalMin("0.01") BigDecimal quantidade,
    @NotNull @DecimalMin("0.01") BigDecimal valorUnit
) {}
