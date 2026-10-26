package io.fixfirst.resolveja.controller;

import io.fixfirst.resolveja.dto.orcamento.OrcamentoRequest;
import io.fixfirst.resolveja.dto.orcamento.OrcamentoResponse;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.service.OrcamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class OrcamentoController {

    private final OrcamentoService orcamentoService;

    // ── Autenticados (/api/orcamentos) ────────────────────────────────────────

    @PostMapping("/api/orcamentos")
    public ResponseEntity<OrcamentoResponse> criar(
            @Valid @RequestBody OrcamentoRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orcamentoService.criar(request, prestador));
    }

    @GetMapping("/api/orcamentos")
    public ResponseEntity<Page<OrcamentoResponse>> listar(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(orcamentoService.listar(prestador.getId(), status, pageable));
    }

    @GetMapping("/api/orcamentos/{id}")
    public ResponseEntity<OrcamentoResponse> buscar(
            @PathVariable UUID id,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(orcamentoService.buscarPorId(id, prestador.getId()));
    }

    @PutMapping("/api/orcamentos/{id}")
    public ResponseEntity<OrcamentoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody OrcamentoRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(orcamentoService.atualizar(id, request, prestador.getId()));
    }

    @PatchMapping("/api/orcamentos/{id}/status")
    public ResponseEntity<OrcamentoResponse> atualizarStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(
                orcamentoService.atualizarStatus(id, body.get("status"), prestador.getId()));
    }

    // ── Público (/api/orcamento/public) ───────────────────────────────────────

    @GetMapping("/api/orcamento/public/{token}")
    public ResponseEntity<OrcamentoResponse> buscarPublico(@PathVariable String token) {
        return ResponseEntity.ok(orcamentoService.buscarPorToken(token));
    }

    @PostMapping("/api/orcamento/public/{token}/aprovar")
    public ResponseEntity<OrcamentoResponse> aprovar(@PathVariable String token) {
        return ResponseEntity.ok(orcamentoService.responderPublico(token, true));
    }

    @PostMapping("/api/orcamento/public/{token}/recusar")
    public ResponseEntity<OrcamentoResponse> recusar(@PathVariable String token) {
        return ResponseEntity.ok(orcamentoService.responderPublico(token, false));
    }
}
