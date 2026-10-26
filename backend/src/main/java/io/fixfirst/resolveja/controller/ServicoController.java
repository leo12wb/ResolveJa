package io.fixfirst.resolveja.controller;

import io.fixfirst.resolveja.dto.servico.ServicoRequest;
import io.fixfirst.resolveja.dto.servico.ServicoResponse;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.service.ServicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/servicos")
@RequiredArgsConstructor
public class ServicoController {

    private final ServicoService servicoService;

    @PostMapping
    public ResponseEntity<ServicoResponse> criar(
            @Valid @RequestBody ServicoRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicoService.criar(request, prestador));
    }

    @GetMapping
    public ResponseEntity<Page<ServicoResponse>> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID clienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(
                servicoService.listar(prestador.getId(), status, clienteId, inicio, fim, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicoResponse> buscar(
            @PathVariable UUID id,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(servicoService.buscarPorId(id, prestador.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicoResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ServicoRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(servicoService.atualizar(id, request, prestador.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ServicoResponse> atualizarStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(
                servicoService.atualizarStatus(id, body.get("status"), prestador.getId()));
    }
}
