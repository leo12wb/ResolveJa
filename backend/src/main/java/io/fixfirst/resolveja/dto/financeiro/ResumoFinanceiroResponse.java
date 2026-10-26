package io.fixfirst.resolveja.dto.financeiro;

import java.math.BigDecimal;

public record ResumoFinanceiroResponse(
    BigDecimal totalReceitas,
    BigDecimal totalDespesas,
    BigDecimal resultadoLiquido,
    BigDecimal totalAReceber,
    BigDecimal ticketMedio,
    long qtdServicosConcluidosMes
) {}
