package io.fixfirst.resolveja.dto.despesa;

import io.fixfirst.resolveja.model.Despesa;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DespesaRequest(
    UUID servicoId,

    @NotBlank(message = "Descrição é obrigatória")
    String descricao,

    @NotNull @DecimalMin("0.01")
    BigDecimal valor,

    @NotNull
    Despesa.Categoria categoria,

    @NotNull(message = "Data é obrigatória")
    LocalDate dataDespesa
) {}
