package io.fixfirst.resolveja.controller;

import io.fixfirst.resolveja.dto.auth.*;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.service.AuthService;
import io.fixfirst.resolveja.service.LgpdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final LgpdService lgpdService;

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registro(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Map<String, String>> recuperarSenha(
            @Valid @RequestBody RecuperarSenhaRequest request) {
        authService.recuperarSenha(request);
        // Sempre retorna sucesso (anti-enumeration)
        return ResponseEntity.ok(Map.of("message",
                "Se o e-mail estiver cadastrado, você receberá as instruções em breve."));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(
            @Valid @RequestBody RedefinirSenhaRequest request) {
        authService.redefinirSenha(request);
        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso."));
    }

    // ── LGPD — Art. 18 ────────────────────────────────────────────────────────

    /** Art. 18, II — Portabilidade: exporta dados pessoais do titular. */
    @GetMapping("/meus-dados")
    public ResponseEntity<ExportacaoDadosResponse> meusDados(
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(lgpdService.exportarDados(prestador));
    }

    /** Art. 18, VI — Exclusão dos dados tratados mediante consentimento. */
    @DeleteMapping("/minha-conta")
    public ResponseEntity<Map<String, String>> excluirConta(
            @AuthenticationPrincipal Prestador prestador) {
        lgpdService.excluirConta(prestador);
        return ResponseEntity.ok(Map.of("message",
                "Sua conta foi encerrada e seus dados pessoais foram removidos conforme a LGPD."));
    }
}
