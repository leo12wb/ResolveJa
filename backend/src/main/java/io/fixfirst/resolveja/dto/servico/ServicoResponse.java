package io.fixfirst.resolveja.dto.servico;

import io.fixfirst.resolveja.model.Servico;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ServicoResponse(
    UUID id,
    UUID clienteId,
    String clienteNome,
    String descricao,
    Servico.Status status,
    BigDecimal valor,
    Boolean pago,
    LocalDate dataServico,
    Instant dataConclusao,
    String observacoes,
    Instant criadoEm,
    Instant atualizadoEm
) {
    public static ServicoResponse from(Servico s) {
        return new ServicoResponse(
            s.getId(),
            s.getCliente().getId(),
            s.getCliente().getNome(),
            s.getDescricao(),
            s.getStatus(),
            s.getValor(),
            s.getPago(),
            s.getDataServico(),
            s.getDataConclusao(),
            s.getObservacoes(),
            s.getCriadoEm(),
            s.getAtualizadoEm()
        );
    }
}
