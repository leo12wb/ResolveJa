package io.fixfirst.resolveja.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import io.fixfirst.resolveja.dto.despesa.DespesaResponse;
import io.fixfirst.resolveja.dto.financeiro.HistoricoMensalResponse;
import io.fixfirst.resolveja.dto.financeiro.ResumoFinanceiroResponse;
import io.fixfirst.resolveja.model.Servico;
import io.fixfirst.resolveja.repository.DespesaRepository;
import io.fixfirst.resolveja.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private static final DateTimeFormatter MES_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final ServicoRepository servicoRepository;
    private final DespesaRepository despesaRepository;

    @Transactional(readOnly = true)
    public ResumoFinanceiroResponse resumo(UUID prestadorId, int ano, int mes) {
        Instant[] range = mesRange(ano, mes);
        LocalDate[] localRange = mesRangeLocal(ano, mes);

        BigDecimal receitas = servicoRepository.somarReceitasRange(
                prestadorId, Servico.Status.CONCLUIDO, range[0], range[1]);
        BigDecimal despesas = despesaRepository.somarDespesasRange(
                prestadorId, localRange[0], localRange[1]);
        BigDecimal aReceber = servicoRepository.somarAReceber(
                prestadorId, Servico.Status.CONCLUIDO);
        long qtdConcluidos = servicoRepository.countConcluidosRange(
                prestadorId, Servico.Status.CONCLUIDO, range[0], range[1]);

        BigDecimal ticketMedio = qtdConcluidos > 0
                ? receitas.divide(BigDecimal.valueOf(qtdConcluidos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new ResumoFinanceiroResponse(
                receitas,
                despesas,
                receitas.subtract(despesas),
                aReceber,
                ticketMedio,
                qtdConcluidos
        );
    }

    @Transactional(readOnly = true)
    public List<HistoricoMensalResponse> historico(UUID prestadorId) {
        List<HistoricoMensalResponse> result = new ArrayList<>();
        YearMonth atual = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = atual.minusMonths(i);
            Instant[] range = mesRange(ym.getYear(), ym.getMonthValue());
            LocalDate[] localRange = mesRangeLocal(ym.getYear(), ym.getMonthValue());

            BigDecimal rec = servicoRepository.somarReceitasRange(
                    prestadorId, Servico.Status.CONCLUIDO, range[0], range[1]);
            BigDecimal desp = despesaRepository.somarDespesasRange(
                    prestadorId, localRange[0], localRange[1]);

            result.add(new HistoricoMensalResponse(ym.format(MES_FMT), rec, desp));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public byte[] gerarPdf(UUID prestadorId, String nomePrestador, int ano, int mes) {
        ResumoFinanceiroResponse resumo = resumo(prestadorId, ano, mes);

        LocalDate[] lr = mesRangeLocal(ano, mes);
        var despesas = despesaRepository.listar(
                prestadorId, lr[0], lr[1], PageRequest.of(0, 500)).getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 60, 60);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(30, 64, 175));
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.DARK_GRAY);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Color.BLACK);
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);

            Month month = Month.of(mes);
            String titulo = "Relatório Financeiro — " + month.name() + "/" + ano;

            doc.add(new Paragraph(titulo, titleFont));
            doc.add(new Paragraph(nomePrestador, subFont));
            doc.add(new Paragraph("Gerado em: " + LocalDate.now(), subFont));
            doc.add(Chunk.NEWLINE);

            // KPIs
            doc.add(new Paragraph("Resumo do Mês", sectionFont));
            doc.add(Chunk.NEWLINE);

            PdfPTable kpiTable = new PdfPTable(2);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingBefore(4);

            addKpiRow(kpiTable, "Receitas (pagas)", "R$ " + resumo.totalReceitas().toPlainString(), cellFont);
            addKpiRow(kpiTable, "Despesas", "R$ " + resumo.totalDespesas().toPlainString(), cellFont);
            addKpiRow(kpiTable, "Resultado Líquido", "R$ " + resumo.resultadoLiquido().toPlainString(), cellFont);
            addKpiRow(kpiTable, "A Receber", "R$ " + resumo.totalAReceber().toPlainString(), cellFont);
            addKpiRow(kpiTable, "Ticket Médio", "R$ " + resumo.ticketMedio().toPlainString(), cellFont);
            addKpiRow(kpiTable, "Serviços Concluídos", String.valueOf(resumo.qtdServicosConcluidosMes()), cellFont);
            doc.add(kpiTable);

            // Despesas
            if (!despesas.isEmpty()) {
                doc.add(Chunk.NEWLINE);
                doc.add(new Paragraph("Despesas do Mês", sectionFont));
                doc.add(Chunk.NEWLINE);

                PdfPTable t = new PdfPTable(new float[]{3, 1.5f, 1.5f, 1.5f});
                t.setWidthPercentage(100);
                t.setSpacingBefore(4);

                for (String h : new String[]{"Descrição", "Categoria", "Data", "Valor"}) {
                    PdfPCell cell = new PdfPCell(new Phrase(h, tableHeaderFont));
                    cell.setBackgroundColor(new Color(30, 64, 175));
                    cell.setPadding(6);
                    t.addCell(cell);
                }

                for (DespesaResponse d : despesas) {
                    t.addCell(new Phrase(d.descricao(), cellFont));
                    t.addCell(new Phrase(d.categoria().name(), cellFont));
                    t.addCell(new Phrase(d.dataDespesa().toString(), cellFont));
                    t.addCell(new Phrase("R$ " + d.valor().toPlainString(), cellFont));
                }
                doc.add(t);
            }

        } finally {
            doc.close();
        }

        return out.toByteArray();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Instant[] mesRange(int ano, int mes) {
        ZonedDateTime start = ZonedDateTime.of(ano, mes, 1, 0, 0, 0, 0, ZoneOffset.UTC);
        ZonedDateTime end = start.plusMonths(1);
        return new Instant[]{ start.toInstant(), end.toInstant() };
    }

    private LocalDate[] mesRangeLocal(int ano, int mes) {
        LocalDate start = LocalDate.of(ano, mes, 1);
        return new LocalDate[]{ start, start.plusMonths(1).minusDays(1) };
    }

    private void addKpiRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell l = new PdfPCell(new Phrase(label, font));
        l.setPadding(5);
        l.setBorderColor(Color.LIGHT_GRAY);
        table.addCell(l);

        PdfPCell v = new PdfPCell(new Phrase(value, font));
        v.setPadding(5);
        v.setBorderColor(Color.LIGHT_GRAY);
        table.addCell(v);
    }
}
