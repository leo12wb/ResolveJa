package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.dto.auth.ExportacaoDadosResponse;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.repository.AgendamentoRepository;
import io.fixfirst.resolveja.repository.ClienteRepository;
import io.fixfirst.resolveja.repository.DespesaRepository;
import io.fixfirst.resolveja.repository.OrcamentoRepository;
import io.fixfirst.resolveja.repository.PrestadorRepository;
import io.fixfirst.resolveja.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * LGPD Art. 18 — Direitos do titular de dados.
 * Implementa portabilidade (inciso II) e exclusão (inciso VI).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LgpdService {

    private final PrestadorRepository prestadorRepository;
    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final DespesaRepository despesaRepository;

    /** Art. 18, II — Exporta todos os dados pessoais do titular. */
    @Transactional(readOnly = true)
    public ExportacaoDadosResponse exportarDados(Prestador prestador) {
        return new ExportacaoDadosResponse(
            prestador.getId(),
            prestador.getNome(),
            prestador.getEmail(),
            prestador.getConsentimentoLgpd(),
            prestador.getConsentimentoData(),
            prestador.getCriadoEm(),
            clienteRepository.countByPrestadorIdAndAtivoTrue(prestador.getId()),
            servicoRepository.countByPrestadorId(prestador.getId()),
            orcamentoRepository.countByPrestadorId(prestador.getId()),
            agendamentoRepository.countByPrestadorId(prestador.getId()),
            despesaRepository.countByPrestadorId(prestador.getId())
        );
    }

    /**
     * Art. 18, VI — Exclusão dos dados tratados com base no consentimento.
     * Anonimiza o cadastro e desativa a conta.
     */
    @Transactional
    public void excluirConta(Prestador prestador) {
        log.info("LGPD — Solicitação de exclusão de conta: {}", prestador.getEmail());

        // Anonimização dos dados pessoais
        prestador.setNome("CONTA REMOVIDA");
        prestador.setEmail("removed_" + prestador.getId() + "@removed.local");
        prestador.setSenhaHash("");
        prestador.setConsentimentoLgpd(false);
        prestador.setConsentimentoData(null);
        prestador.setAtivo(false);
        prestador.setAtualizadoEm(Instant.now());

        prestadorRepository.save(prestador);
        log.info("LGPD — Conta anonimizada com sucesso: {}", prestador.getId());
    }
}
