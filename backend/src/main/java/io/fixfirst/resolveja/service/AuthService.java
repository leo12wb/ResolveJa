package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.dto.auth.*;
import io.fixfirst.resolveja.exception.BusinessException;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.model.TokenRecuperacao;
import io.fixfirst.resolveja.repository.PrestadorRepository;
import io.fixfirst.resolveja.repository.TokenRecuperacaoRepository;
import io.fixfirst.resolveja.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final PrestadorRepository prestadorRepository;
    private final TokenRecuperacaoRepository tokenRecuperacaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse registrar(RegistroRequest req) {
        if (prestadorRepository.existsByEmail(req.email())) {
            throw new BusinessException("E-mail já cadastrado.");
        }
        if (!req.consentimentoLgpd()) {
            throw new BusinessException("É necessário aceitar a Política de Privacidade para se cadastrar.");
        }

        Prestador prestador = Prestador.builder()
                .nome(req.nome().trim())
                .email(req.email().toLowerCase().trim())
                .senhaHash(passwordEncoder.encode(req.senha()))
                .consentimentoLgpd(true)
                .consentimentoData(Instant.now())
                .build();

        prestadorRepository.save(prestador);
        log.info("Novo prestador registrado: {}", prestador.getEmail());

        String token = jwtService.gerarToken(prestador);
        return toAuthResponse(token, prestador);
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.email().toLowerCase().trim(),
                            req.senha()));
        } catch (BadCredentialsException e) {
            throw new BusinessException("E-mail ou senha inválidos.");
        }

        Prestador prestador = prestadorRepository.findByEmail(req.email().toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("E-mail ou senha inválidos."));

        String token = jwtService.gerarToken(prestador);
        log.info("Login realizado: {}", prestador.getEmail());
        return toAuthResponse(token, prestador);
    }

    @Transactional
    public void recuperarSenha(RecuperarSenhaRequest req) {
        // Sempre retorna sucesso para não revelar se e-mail existe (anti-enumeration)
        prestadorRepository.findByEmail(req.email().toLowerCase().trim()).ifPresent(prestador -> {
            String tokenStr = UUID.randomUUID().toString().replace("-", "");
            TokenRecuperacao tokenRec = TokenRecuperacao.builder()
                    .prestador(prestador)
                    .token(tokenStr)
                    .expiraEm(Instant.now().plusSeconds(3600)) // 1 hora
                    .build();
            tokenRecuperacaoRepository.save(tokenRec);
            emailService.enviarRecuperacaoSenha(prestador.getEmail(), prestador.getNome(), tokenStr);
        });
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaRequest req) {
        TokenRecuperacao tokenRec = tokenRecuperacaoRepository
                .findByTokenAndUsadoFalse(req.token())
                .orElseThrow(() -> new BusinessException("Token inválido ou expirado."));

        if (tokenRec.getExpiraEm().isBefore(Instant.now())) {
            throw new BusinessException("Token expirado. Solicite uma nova recuperação de senha.");
        }

        Prestador prestador = tokenRec.getPrestador();
        prestador.setSenhaHash(passwordEncoder.encode(req.novaSenha()));
        prestadorRepository.save(prestador);

        tokenRec.setUsado(true);
        tokenRecuperacaoRepository.save(tokenRec);

        log.info("Senha redefinida para: {}", prestador.getEmail());
    }

    private AuthResponse toAuthResponse(String token, Prestador p) {
        return new AuthResponse(token,
                new AuthResponse.PrestadorInfo(p.getId(), p.getNome(), p.getEmail()));
    }
}
