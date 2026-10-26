package io.fixfirst.resolveja.dto.auth;

import java.time.Instant;
import java.util.UUID;

/**
 * LGPD Art. 18, II — Direito de acesso aos dados.
 * Exporta os dados pessoais do titular armazenados na plataforma.
 */
public record ExportacaoDadosResponse(
    UUID id,
    String nome,
    String email,
    Boolean consentimentoLgpd,
    Instant consentimentoData,
    Instant contaCriadaEm,
    long totalClientes,
    long totalServicos,
    long totalOrcamentos,
    long totalAgendamentos,
    long totalDespesas
) {}
