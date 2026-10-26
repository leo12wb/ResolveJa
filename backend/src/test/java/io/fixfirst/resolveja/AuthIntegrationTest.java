package io.fixfirst.resolveja;

import io.fixfirst.resolveja.dto.auth.*;
import io.fixfirst.resolveja.exception.BusinessException;
import io.fixfirst.resolveja.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Auth — testes de integração")
class AuthIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    AuthService authService;

    // EmailService usa SMTP externo: mock para não bloquear os testes
    @MockBean
    io.fixfirst.resolveja.service.EmailService emailService;

    private RegistroRequest novoRegistro(String suffix) {
        return new RegistroRequest(
                "Teste " + suffix,
                "teste_" + suffix + "@resolveja.test",
                "Senha@123456",
                true
        );
    }

    @Test
    @DisplayName("Registro cria conta e retorna JWT")
    void registroRetornaToken() {
        AuthResponse resp = authService.registrar(novoRegistro("reg1"));

        assertThat(resp.token()).isNotBlank();
        assertThat(resp.prestador().email()).isEqualTo("teste_reg1@resolveja.test");
    }

    @Test
    @DisplayName("Registro com e-mail duplicado lança BusinessException")
    void registroDuplicadoFalha() {
        authService.registrar(novoRegistro("dup"));

        assertThatThrownBy(() -> authService.registrar(novoRegistro("dup")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("já cadastrado");
    }

    @Test
    @DisplayName("Registro sem consentimento LGPD lança BusinessException")
    void registroSemConsentimentoFalha() {
        RegistroRequest req = new RegistroRequest(
                "Sem Consentimento", "semconsent@test.com", "Senha@123", false);

        assertThatThrownBy(() -> authService.registrar(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Política de Privacidade");
    }

    @Test
    @DisplayName("Login com credenciais válidas retorna JWT")
    void loginValido() {
        authService.registrar(novoRegistro("login1"));

        AuthResponse resp = authService.login(new LoginRequest(
                "teste_login1@resolveja.test", "Senha@123456"));

        assertThat(resp.token()).isNotBlank();
    }

    @Test
    @DisplayName("Login com senha incorreta lança BusinessException")
    void loginSenhaErradaFalha() {
        authService.registrar(novoRegistro("login2"));

        assertThatThrownBy(() -> authService.login(
                new LoginRequest("teste_login2@resolveja.test", "SenhaErrada")))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("recuperarSenha não revela se e-mail existe (anti-enumeration)")
    void recuperarSenhaNaoRevela() {
        // Deve completar sem lançar exceção, independente do e-mail existir
        assertThatNoException().isThrownBy(() ->
                authService.recuperarSenha(new RecuperarSenhaRequest("inexistente@test.com")));
    }
}
