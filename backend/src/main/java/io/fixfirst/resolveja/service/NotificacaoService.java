package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.exception.ResourceNotFoundException;
import io.fixfirst.resolveja.model.Notificacao;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    @Transactional(readOnly = true)
    public Page<Notificacao> listar(UUID prestadorId, Pageable pageable) {
        return notificacaoRepository.findByPrestadorIdOrderByCriadoEmDesc(prestadorId, pageable);
    }

    @Transactional(readOnly = true)
    public long countNaoLidas(UUID prestadorId) {
        return notificacaoRepository.countByPrestadorIdAndLidaFalse(prestadorId);
    }

    @Transactional
    public Notificacao marcarLida(UUID id, UUID prestadorId) {
        Notificacao n = notificacaoRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação", id.toString()));
        n.setLida(true);
        return notificacaoRepository.save(n);
    }

    @Transactional
    public void marcarTodasLidas(UUID prestadorId) {
        notificacaoRepository.marcarTodasLidas(prestadorId);
    }

    /** Cria notificação programaticamente (chamado por outros serviços). */
    @Transactional
    public void criar(Prestador prestador, String tipo, String mensagem,
                      String entidadeTipo, UUID entidadeId) {
        notificacaoRepository.save(Notificacao.builder()
                .prestador(prestador)
                .tipo(tipo)
                .mensagem(mensagem)
                .entidadeTipo(entidadeTipo)
                .entidadeId(entidadeId)
                .build());
    }
}
