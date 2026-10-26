package io.fixfirst.resolveja.controller;

import io.fixfirst.resolveja.model.Notificacao;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.service.NotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    @GetMapping
    public ResponseEntity<Page<Notificacao>> listar(
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(notificacaoService.listar(prestador.getId(), pageable));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count(
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(
                Map.of("naoLidas", notificacaoService.countNaoLidas(prestador.getId())));
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Notificacao> marcarLida(
            @PathVariable UUID id,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(notificacaoService.marcarLida(id, prestador.getId()));
    }

    @PatchMapping("/marcar-todas-lidas")
    public ResponseEntity<Void> marcarTodasLidas(
            @AuthenticationPrincipal Prestador prestador) {
        notificacaoService.marcarTodasLidas(prestador.getId());
        return ResponseEntity.noContent().build();
    }
}
