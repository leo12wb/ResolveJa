package io.fixfirst.resolveja.dto.orcamento;

import io.fixfirst.resolveja.model.OrcamentoItem;

import java.math.BigDecimal;
import java.util.UUID;

public record OrcamentoItemResponse(
    UUID id,
    String descricao,
    BigDecimal quantidade,
    BigDecimal valorUnit
) {
    public static OrcamentoItemResponse from(OrcamentoItem item) {
        return new OrcamentoItemResponse(
            item.getId(),
            item.getDescricao(),
            item.getQuantidade(),
            item.getValorUnit()
        );
    }
}
