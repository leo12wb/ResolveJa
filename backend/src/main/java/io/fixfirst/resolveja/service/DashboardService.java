package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.dto.agendamento.AgendamentoResponse;
import io.fixfirst.resolveja.dto.financeiro.ResumoFinanceiroResponse;
import io.fixfirst.resolveja.model.Agendamento;
import io.fixfirst.resolveja.model.Orcamento;
import io.fixfirst.resolveja.model.Servico;
import io.fixfirst.resolveja.repository.AgendamentoRepository;
import io.fixfirst.resolveja.repository.ClienteRepository;
import io.fixfirst.resolveja.repository.OrcamentoRepository;
import io.fixfirst.resolveja.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ServicoRepository servicoRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final FinanceiroService financeiroService;

    public record DashboardData(
        List<AgendamentoResponse> proximosAgendamentos,
        long orcamentosAguardando,
        long servicosEmAndamento,
        ResumoFinanceiroResponse resumoMes,
        long totalClientesAtivos,
        List<String> alertas
    ) {}

    @Transactional(readOnly = true)
    public DashboardData carregar(UUID prestadorId) {
        YearMonth ym = YearMonth.now();

        long emAndamento = servicoRepository.countByPrestadorIdAndStatus(
                prestadorId, Servico.Status.EM_ANDAMENTO);
        long aguardando = orcamentoRepository.countByPrestadorIdAndStatus(
                prestadorId, Orcamento.Status.ENVIADO);
        long clientesAtivos = clienteRepository.countByPrestadorIdAndAtivoTrue(prestadorId);

        List<AgendamentoResponse> proximos = agendamentoRepository
                .findProximos(prestadorId, Agendamento.Status.AGENDADO,
                        Instant.now(), PageRequest.of(0, 5))
                .stream()
                .map(AgendamentoResponse::from)
                .toList();

        ResumoFinanceiroResponse resumo = financeiroService.resumo(
                prestadorId, ym.getYear(), ym.getMonthValue());

        List<String> alertas = gerarAlertas(prestadorId, resumo);

        return new DashboardData(proximos, aguardando, emAndamento, resumo, clientesAtivos, alertas);
    }

    private List<String> gerarAlertas(UUID prestadorId, ResumoFinanceiroResponse resumo) {
        List<String> alertas = new ArrayList<>();

        long pendentes = servicoRepository.countByPrestadorIdAndStatus(
                prestadorId, Servico.Status.PENDENTE);
        if (pendentes > 0) {
            alertas.add(pendentes + " serviço(s) pendente(s) aguardando início.");
        }
        if (resumo.totalAReceber().doubleValue() > 0) {
            alertas.add("Há R$ " + resumo.totalAReceber().toPlainString() + " a receber de serviços concluídos.");
        }
        if (resumo.resultadoLiquido().doubleValue() < 0) {
            alertas.add("Resultado líquido negativo neste mês. Revise as despesas.");
        }

        return alertas;
    }
}
