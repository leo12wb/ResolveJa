package io.fixfirst.resolveja.controller;

import io.fixfirst.resolveja.dto.agendamento.AgendamentoRequest;
import io.fixfirst.resolveja.dto.agendamento.AgendamentoResponse;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.service.AgendamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @PostMapping
    public ResponseEntity<AgendamentoResponse> criar(
            @Valid @RequestBody AgendamentoRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendamentoService.criar(request, prestador));
    }

    @GetMapping
    public ResponseEntity<List<AgendamentoResponse>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fim,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(agendamentoService.listar(prestador.getId(), inicio, fim));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoResponse> buscar(
            @PathVariable UUID id,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(agendamentoService.buscarPorId(id, prestador.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendamentoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody AgendamentoRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(agendamentoService.atualizar(id, request, prestador.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AgendamentoResponse> atualizarStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(
                agendamentoService.atualizarStatus(id, body.get("status"), prestador.getId()));
    }
}
