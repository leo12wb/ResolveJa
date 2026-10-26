package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.dto.orcamento.OrcamentoItemRequest;
import io.fixfirst.resolveja.dto.orcamento.OrcamentoRequest;
import io.fixfirst.resolveja.dto.orcamento.OrcamentoResponse;
import io.fixfirst.resolveja.exception.BusinessException;
import io.fixfirst.resolveja.exception.ResourceNotFoundException;
import io.fixfirst.resolveja.model.Cliente;
import io.fixfirst.resolveja.model.Orcamento;
import io.fixfirst.resolveja.model.OrcamentoItem;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.repository.ClienteRepository;
import io.fixfirst.resolveja.repository.OrcamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrcamentoService {

    private static final String TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int TOKEN_LEN = 12;
    private static final SecureRandom RNG = new SecureRandom();

    private final OrcamentoRepository orcamentoRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public OrcamentoResponse criar(OrcamentoRequest req, Prestador prestador) {
        Cliente cliente = resolverCliente(req.clienteId(), prestador.getId());

        int dias = req.validadeDias() > 0 ? req.validadeDias() : 7;
        Orcamento orcamento = Orcamento.builder()
                .prestador(prestador)
                .cliente(cliente)
                .tokenPublico(gerarTokenUnico())
                .validadeDias(dias)
                .validadeData(LocalDate.now().plusDays(dias))
                .observacoes(req.observacoes())
                .build();

        aplicarItens(orcamento, req.itens());
        orcamento.setTotal(calcularTotal(orcamento.getItens()));

        return OrcamentoResponse.from(orcamentoRepository.save(orcamento));
    }

    @Transactional(readOnly = true)
    public Page<OrcamentoResponse> listar(UUID prestadorId, String status, Pageable pageable) {
        Orcamento.Status statusEnum = parseStatus(status);
        return orcamentoRepository.listar(prestadorId, statusEnum, pageable)
                .map(OrcamentoResponse::from);
    }

    @Transactional(readOnly = true)
    public OrcamentoResponse buscarPorId(UUID id, UUID prestadorId) {
        return orcamentoRepository.findByIdAndPrestadorId(id, prestadorId)
                .map(OrcamentoResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento", id.toString()));
    }

    @Transactional
    public OrcamentoResponse atualizar(UUID id, OrcamentoRequest req, UUID prestadorId) {
        Orcamento orcamento = orcamentoRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento", id.toString()));

        if (orcamento.getStatus() != Orcamento.Status.RASCUNHO) {
            throw new BusinessException("Apenas orçamentos em rascunho podem ser editados.");
        }

        int dias = req.validadeDias() > 0 ? req.validadeDias() : 7;
        orcamento.setCliente(resolverCliente(req.clienteId(), prestadorId));
        orcamento.setValidadeDias(dias);
        orcamento.setValidadeData(LocalDate.now().plusDays(dias));
        orcamento.setObservacoes(req.observacoes());

        orcamento.getItens().clear();
        aplicarItens(orcamento, req.itens());
        orcamento.setTotal(calcularTotal(orcamento.getItens()));
        orcamento.setAtualizadoEm(Instant.now());

        return OrcamentoResponse.from(orcamentoRepository.save(orcamento));
    }

    @Transactional
    public OrcamentoResponse atualizarStatus(UUID id, String novoStatus, UUID prestadorId) {
        Orcamento orcamento = orcamentoRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento", id.toString()));
        orcamento.setStatus(parseStatusRequired(novoStatus));
        orcamento.setAtualizadoEm(Instant.now());
        return OrcamentoResponse.from(orcamentoRepository.save(orcamento));
    }

    // ── Acesso público ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public OrcamentoResponse buscarPorToken(String token) {
        return orcamentoRepository.findByTokenPublico(token)
                .map(OrcamentoResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento", token));
    }

    @Transactional
    public OrcamentoResponse responderPublico(String token, boolean aprovar) {
        Orcamento orcamento = orcamentoRepository.findByTokenPublico(token)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento", token));

        if (orcamento.getStatus() != Orcamento.Status.ENVIADO) {
            throw new BusinessException("Este orçamento não está aguardando aprovação.");
        }
        if (orcamento.getValidadeData().isBefore(LocalDate.now())) {
            orcamento.setStatus(Orcamento.Status.EXPIRADO);
            orcamento.setAtualizadoEm(Instant.now());
            orcamentoRepository.save(orcamento);
            throw new BusinessException("Este orçamento está expirado.");
        }

        orcamento.setStatus(aprovar ? Orcamento.Status.APROVADO : Orcamento.Status.RECUSADO);
        orcamento.setAtualizadoEm(Instant.now());
        return OrcamentoResponse.from(orcamentoRepository.save(orcamento));
    }

    // ── Privado ───────────────────────────────────────────────────────────────

    private Cliente resolverCliente(UUID clienteId, UUID prestadorId) {
        if (clienteId == null) return null;
        return clienteRepository.findByIdAndPrestadorId(clienteId, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", clienteId.toString()));
    }

    private void aplicarItens(Orcamento orcamento, List<OrcamentoItemRequest> itensReq) {
        itensReq.forEach(ir -> orcamento.getItens().add(
            OrcamentoItem.builder()
                .orcamento(orcamento)
                .descricao(ir.descricao().trim())
                .quantidade(ir.quantidade())
                .valorUnit(ir.valorUnit())
                .build()
        ));
    }

    private BigDecimal calcularTotal(List<OrcamentoItem> itens) {
        return itens.stream()
                .map(i -> i.getValorUnit().multiply(i.getQuantidade()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String gerarTokenUnico() {
        String token;
        do { token = gerarToken(); }
        while (orcamentoRepository.existsByTokenPublico(token));
        return token;
    }

    private String gerarToken() {
        StringBuilder sb = new StringBuilder(TOKEN_LEN);
        for (int i = 0; i < TOKEN_LEN; i++) {
            sb.append(TOKEN_CHARS.charAt(RNG.nextInt(TOKEN_CHARS.length())));
        }
        return sb.toString();
    }

    private Orcamento.Status parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        return parseStatusRequired(status);
    }

    private Orcamento.Status parseStatusRequired(String status) {
        try { return Orcamento.Status.valueOf(status.toUpperCase()); }
        catch (IllegalArgumentException e) {
            throw new BusinessException("Status inválido: " + status);
        }
    }
}
