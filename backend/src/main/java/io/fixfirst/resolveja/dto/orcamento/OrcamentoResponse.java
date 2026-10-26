package io.fixfirst.resolveja.dto.orcamento;

import io.fixfirst.resolveja.model.Orcamento;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrcamentoResponse(
    UUID id,
    UUID clienteId,
    String clienteNome,
    String tokenPublico,
    Orcamento.Status status,
    int validadeDias,
    LocalDate validadeData,
    BigDecimal total,
    String observacoes,
    List<OrcamentoItemResponse> itens,
    Instant criadoEm,
    Instant atualizadoEm
) {
    public static OrcamentoResponse from(Orcamento o) {
        return new OrcamentoResponse(
            o.getId(),
            o.getCliente() != null ? o.getCliente().getId() : null,
            o.getCliente() != null ? o.getCliente().getNome() : null,
            o.getTokenPublico(),
            o.getStatus(),
            o.getValidadeDias(),
            o.getValidadeData(),
            o.getTotal(),
            o.getObservacoes(),
            o.getItens().stream().map(OrcamentoItemResponse::from).toList(),
            o.getCriadoEm(),
            o.getAtualizadoEm()
        );
    }
}
