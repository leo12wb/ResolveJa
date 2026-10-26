package io.fixfirst.resolveja.dto.financeiro;

import java.math.BigDecimal;

public record HistoricoMensalResponse(
    String mes,          // "2026-10"
    BigDecimal receitas,
    BigDecimal despesas
) {}
