package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.dto.servico.ServicoRequest;
import io.fixfirst.resolveja.dto.servico.ServicoResponse;
import io.fixfirst.resolveja.exception.BusinessException;
import io.fixfirst.resolveja.exception.ResourceNotFoundException;
import io.fixfirst.resolveja.model.Cliente;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.model.Servico;
import io.fixfirst.resolveja.repository.ClienteRepository;
import io.fixfirst.resolveja.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public ServicoResponse criar(ServicoRequest req, Prestador prestador) {
        Cliente cliente = clienteRepository
                .findByIdAndPrestadorId(req.clienteId(), prestador.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", req.clienteId().toString()));

        Servico servico = Servico.builder()
                .prestador(prestador)
                .cliente(cliente)
                .descricao(req.descricao().trim())
                .status(req.status() != null ? req.status() : Servico.Status.PENDENTE)
                .valor(req.valor())
                .pago(req.pago() != null ? req.pago() : false)
                .dataServico(req.dataServico())
                .observacoes(req.observacoes())
                .build();

        return ServicoResponse.from(servicoRepository.save(servico));
    }

    @Transactional(readOnly = true)
    public Page<ServicoResponse> listar(
            UUID prestadorId, String status, UUID clienteId,
            LocalDate inicio, LocalDate fim, Pageable pageable) {

        Servico.Status statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = Servico.Status.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException e) { throw new BusinessException("Status inválido: " + status); }
        }

        return servicoRepository.filtrar(prestadorId, statusEnum, clienteId, inicio, fim, pageable)
                .map(ServicoResponse::from);
    }

    @Transactional(readOnly = true)
    public ServicoResponse buscarPorId(UUID id, UUID prestadorId) {
        return servicoRepository.findByIdAndPrestadorId(id, prestadorId)
                .map(ServicoResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço", id.toString()));
    }

    @Transactional
    public ServicoResponse atualizar(UUID id, ServicoRequest req, UUID prestadorId) {
        Servico servico = servicoRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço", id.toString()));

        if (req.clienteId() != null && !req.clienteId().equals(servico.getCliente().getId())) {
            Cliente novoCliente = clienteRepository
                    .findByIdAndPrestadorId(req.clienteId(), prestadorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente", req.clienteId().toString()));
            servico.setCliente(novoCliente);
        }

        servico.setDescricao(req.descricao().trim());
        servico.setValor(req.valor());
        servico.setDataServico(req.dataServico());
        servico.setObservacoes(req.observacoes());
        if (req.pago() != null) servico.setPago(req.pago());

        // Transição de status com regras de negócio
        if (req.status() != null && req.status() != servico.getStatus()) {
            atualizarStatus(servico, req.status());
        }

        servico.setAtualizadoEm(Instant.now());
        return ServicoResponse.from(servicoRepository.save(servico));
    }

    @Transactional
    public ServicoResponse atualizarStatus(UUID id, String novoStatus, UUID prestadorId) {
        Servico servico = servicoRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço", id.toString()));
        try {
            atualizarStatus(servico, Servico.Status.valueOf(novoStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status inválido: " + novoStatus);
        }
        servico.setAtualizadoEm(Instant.now());
        return ServicoResponse.from(servicoRepository.save(servico));
    }

    private void atualizarStatus(Servico servico, Servico.Status novoStatus) {
        servico.setStatus(novoStatus);
        if (novoStatus == Servico.Status.CONCLUIDO && servico.getDataConclusao() == null) {
            servico.setDataConclusao(Instant.now());
        }
    }
}
