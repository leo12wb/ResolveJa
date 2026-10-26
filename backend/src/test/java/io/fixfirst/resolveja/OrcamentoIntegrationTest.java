package io.fixfirst.resolveja;

import io.fixfirst.resolveja.dto.auth.RegistroRequest;
import io.fixfirst.resolveja.dto.orcamento.OrcamentoItemRequest;
import io.fixfirst.resolveja.dto.orcamento.OrcamentoRequest;
import io.fixfirst.resolveja.dto.orcamento.OrcamentoResponse;
import io.fixfirst.resolveja.exception.BusinessException;
import io.fixfirst.resolveja.model.Orcamento;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.repository.PrestadorRepository;
import io.fixfirst.resolveja.service.AuthService;
import io.fixfirst.resolveja.service.OrcamentoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Orçamento — testes de integração")
class OrcamentoIntegrationTest extends AbstractIntegrationTest {

    @Autowired OrcamentoService orcamentoService;
    @Autowired AuthService authService;
    @Autowired PrestadorRepository prestadorRepository;

    @MockBean
    io.fixfirst.resolveja.service.EmailService emailService;

    private Prestador prestador;

    @BeforeEach
    void setUp() {
        String suffix = String.valueOf(System.nanoTime());
        authService.registrar(new RegistroRequest(
                "Prestador Teste", "prest_" + suffix + "@test.com", "Senha@123456", true));
        prestador = prestadorRepository.findByEmail("prest_" + suffix + "@test.com").orElseThrow();
    }

    private OrcamentoRequest pedidoSimples() {
        return new OrcamentoRequest(
                null,
                7,
                "Pagamento em 7 dias",
                List.of(new OrcamentoItemRequest(
                        "Instalação elétrica",
                        BigDecimal.ONE,
                        new BigDecimal("450.00")))
        );
    }

    @Test
    @DisplayName("Criar orçamento gera token único e calcula total")
    void criarOrcamentoCalculaTotal() {
        OrcamentoResponse resp = orcamentoService.criar(pedidoSimples(), prestador);

        assertThat(resp.tokenPublico()).hasSize(12);
        assertThat(resp.total()).isEqualByComparingTo(new BigDecimal("450.00"));
        assertThat(resp.status()).isEqualTo(Orcamento.Status.RASCUNHO);
        assertThat(resp.itens()).hasSize(1);
    }

    @Test
    @DisplayName("Dois orçamentos têm tokens distintos")
    void tokensDevemSerUnicos() {
        OrcamentoResponse r1 = orcamentoService.criar(pedidoSimples(), prestador);
        OrcamentoResponse r2 = orcamentoService.criar(pedidoSimples(), prestador);

        assertThat(r1.tokenPublico()).isNotEqualTo(r2.tokenPublico());
    }

    @Test
    @DisplayName("Enviar orçamento muda status para ENVIADO")
    void enviarOrcamentoMudaStatus() {
        OrcamentoResponse criado = orcamentoService.criar(pedidoSimples(), prestador);

        OrcamentoResponse enviado = orcamentoService.atualizarStatus(
                criado.id(), "ENVIADO", prestador.getId());

        assertThat(enviado.status()).isEqualTo(Orcamento.Status.ENVIADO);
    }

    @Test
    @DisplayName("Aprovação via link público muda status para APROVADO")
    void aprovacaoPublicaFunciona() {
        OrcamentoResponse criado = orcamentoService.criar(pedidoSimples(), prestador);
        orcamentoService.atualizarStatus(criado.id(), "ENVIADO", prestador.getId());

        OrcamentoResponse aprovado = orcamentoService.responderPublico(
                criado.tokenPublico(), true);

        assertThat(aprovado.status()).isEqualTo(Orcamento.Status.APROVADO);
    }

    @Test
    @DisplayName("Não é possível aprovar orçamento que não está ENVIADO")
    void naoAprovaSemEnvio() {
        OrcamentoResponse criado = orcamentoService.criar(pedidoSimples(), prestador);

        assertThatThrownBy(() -> orcamentoService.responderPublico(criado.tokenPublico(), true))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("aguardando aprovação");
    }

    @Test
    @DisplayName("Não é possível editar orçamento já enviado")
    void naoEditaEnviado() {
        OrcamentoResponse criado = orcamentoService.criar(pedidoSimples(), prestador);
        orcamentoService.atualizarStatus(criado.id(), "ENVIADO", prestador.getId());

        assertThatThrownBy(() -> orcamentoService.atualizar(
                criado.id(), pedidoSimples(), prestador.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("rascunho");
    }

    @Test
    @DisplayName("Listar retorna apenas os orçamentos do prestador autenticado")
    void listarRetornaApenasDosPrestador() {
        orcamentoService.criar(pedidoSimples(), prestador);
        orcamentoService.criar(pedidoSimples(), prestador);

        var page = orcamentoService.listar(prestador.getId(), null, PageRequest.of(0, 20));

        assertThat(page.getContent()).hasSizeGreaterThanOrEqualTo(2);
        assertThat(page.getContent())
                .allSatisfy(o -> assertThat(o.status()).isNotNull());
    }
}
