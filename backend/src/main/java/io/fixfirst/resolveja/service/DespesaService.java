package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.dto.despesa.DespesaRequest;
import io.fixfirst.resolveja.dto.despesa.DespesaResponse;
import io.fixfirst.resolveja.exception.ResourceNotFoundException;
import io.fixfirst.resolveja.model.Despesa;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.model.Servico;
import io.fixfirst.resolveja.repository.DespesaRepository;
import io.fixfirst.resolveja.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final ServicoRepository servicoRepository;

    @Transactional
    public DespesaResponse criar(DespesaRequest req, Prestador prestador) {
        Servico servico = resolverServico(req.servicoId(), prestador.getId());

        Despesa despesa = Despesa.builder()
                .prestador(prestador)
                .servico(servico)
                .descricao(req.descricao().trim())
                .valor(req.valor())
                .categoria(req.categoria())
                .dataDespesa(req.dataDespesa())
                .build();

        return DespesaResponse.from(despesaRepository.save(despesa));
    }

    @Transactional(readOnly = true)
    public Page<DespesaResponse> listar(UUID prestadorId, LocalDate inicio, LocalDate fim, Pageable pageable) {
        return despesaRepository.listar(prestadorId, inicio, fim, pageable)
                .map(DespesaResponse::from);
    }

    @Transactional
    public DespesaResponse atualizar(UUID id, DespesaRequest req, UUID prestadorId) {
        Despesa despesa = despesaRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa", id.toString()));

        despesa.setServico(resolverServico(req.servicoId(), prestadorId));
        despesa.setDescricao(req.descricao().trim());
        despesa.setValor(req.valor());
        despesa.setCategoria(req.categoria());
        despesa.setDataDespesa(req.dataDespesa());

        return DespesaResponse.from(despesaRepository.save(despesa));
    }

    @Transactional
    public void excluir(UUID id, UUID prestadorId) {
        Despesa despesa = despesaRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa", id.toString()));
        despesaRepository.delete(despesa);
    }

    private Servico resolverServico(UUID servicoId, UUID prestadorId) {
        if (servicoId == null) return null;
        return servicoRepository.findByIdAndPrestadorId(servicoId, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço", servicoId.toString()));
    }
}
