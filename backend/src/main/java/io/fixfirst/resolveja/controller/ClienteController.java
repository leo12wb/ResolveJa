package io.fixfirst.resolveja.controller;

import io.fixfirst.resolveja.dto.cliente.ClienteRequest;
import io.fixfirst.resolveja.dto.cliente.ClienteResponse;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    public ResponseEntity<ClienteResponse> criar(
            @Valid @RequestBody ClienteRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteService.criar(request, prestador));
    }

    @GetMapping
    public ResponseEntity<Page<ClienteResponse>> listar(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(clienteService.listar(prestador.getId(), q, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> buscar(
            @PathVariable UUID id,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(clienteService.buscarPorId(id, prestador.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ClienteRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(clienteService.atualizar(id, request, prestador.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable UUID id,
            @AuthenticationPrincipal Prestador prestador) {
        clienteService.desativar(id, prestador.getId());
        return ResponseEntity.noContent().build();
    }
}
