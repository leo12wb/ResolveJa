package io.fixfirst.resolveja.controller;

import io.fixfirst.resolveja.dto.despesa.DespesaRequest;
import io.fixfirst.resolveja.dto.despesa.DespesaResponse;
import io.fixfirst.resolveja.dto.financeiro.HistoricoMensalResponse;
import io.fixfirst.resolveja.dto.financeiro.ResumoFinanceiroResponse;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.service.DespesaService;
import io.fixfirst.resolveja.service.FinanceiroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class FinanceiroController {

    private final DespesaService despesaService;
    private final FinanceiroService financeiroService;

    // ── Resumo ─────────────────────────────────────────────────────────────────

    @GetMapping("/api/financeiro/resumo")
    public ResponseEntity<ResumoFinanceiroResponse> resumo(
            @RequestParam(defaultValue = "0") int ano,
            @RequestParam(defaultValue = "0") int mes,
            @AuthenticationPrincipal Prestador prestador) {
        YearMonth ym = (ano > 0 && mes > 0) ? YearMonth.of(ano, mes) : YearMonth.now();
        return ResponseEntity.ok(
                financeiroService.resumo(prestador.getId(), ym.getYear(), ym.getMonthValue()));
    }

    @GetMapping("/api/financeiro/historico")
    public ResponseEntity<List<HistoricoMensalResponse>> historico(
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(financeiroService.historico(prestador.getId()));
    }

    @GetMapping("/api/financeiro/relatorio/pdf")
    public ResponseEntity<byte[]> relatorioPdf(
            @RequestParam(defaultValue = "0") int ano,
            @RequestParam(defaultValue = "0") int mes,
            @AuthenticationPrincipal Prestador prestador) {
        YearMonth ym = (ano > 0 && mes > 0) ? YearMonth.of(ano, mes) : YearMonth.now();
        byte[] pdf = financeiroService.gerarPdf(
                prestador.getId(), prestador.getNome(), ym.getYear(), ym.getMonthValue());

        String filename = "relatorio-" + ym.getYear() + "-" + String.format("%02d", ym.getMonthValue()) + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // ── Despesas ───────────────────────────────────────────────────────────────

    @PostMapping("/api/despesas")
    public ResponseEntity<DespesaResponse> criar(
            @Valid @RequestBody DespesaRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(despesaService.criar(request, prestador));
    }

    @GetMapping("/api/despesas")
    public ResponseEntity<Page<DespesaResponse>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(despesaService.listar(prestador.getId(), inicio, fim, pageable));
    }

    @PutMapping("/api/despesas/{id}")
    public ResponseEntity<DespesaResponse> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody DespesaRequest request,
            @AuthenticationPrincipal Prestador prestador) {
        return ResponseEntity.ok(despesaService.atualizar(id, request, prestador.getId()));
    }

    @DeleteMapping("/api/despesas/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable UUID id,
            @AuthenticationPrincipal Prestador prestador) {
        despesaService.excluir(id, prestador.getId());
        return ResponseEntity.noContent().build();
    }
}
