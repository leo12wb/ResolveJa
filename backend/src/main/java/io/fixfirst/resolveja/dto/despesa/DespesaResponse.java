package io.fixfirst.resolveja.dto.despesa;

import io.fixfirst.resolveja.model.Despesa;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DespesaResponse(
    UUID id,
    UUID servicoId,
    String descricao,
    BigDecimal valor,
    Despesa.Categoria categoria,
    LocalDate dataDespesa,
    Instant criadoEm
) {
    public static DespesaResponse from(Despesa d) {
        return new DespesaResponse(
            d.getId(),
            d.getServico() != null ? d.getServico().getId() : null,
            d.getDescricao(),
            d.getValor(),
            d.getCategoria(),
            d.getDataDespesa(),
            d.getCriadoEm()
        );
    }
}
