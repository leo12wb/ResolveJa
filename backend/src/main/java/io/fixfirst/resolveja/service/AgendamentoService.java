package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.dto.agendamento.AgendamentoRequest;
import io.fixfirst.resolveja.dto.agendamento.AgendamentoResponse;
import io.fixfirst.resolveja.exception.BusinessException;
import io.fixfirst.resolveja.exception.ResourceNotFoundException;
import io.fixfirst.resolveja.model.Agendamento;
import io.fixfirst.resolveja.model.Cliente;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.repository.AgendamentoRepository;
import io.fixfirst.resolveja.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public AgendamentoResponse criar(AgendamentoRequest req, Prestador prestador) {
        Cliente cliente = resolverCliente(req.clienteId(), prestador.getId());

        Agendamento agendamento = Agendamento.builder()
                .prestador(prestador)
                .cliente(cliente)
                .dataHora(req.dataHora())
                .duracaoMin(req.duracaoMin() > 0 ? req.duracaoMin() : 60)
                .descricao(req.descricao())
                .build();

        return AgendamentoResponse.from(agendamentoRepository.save(agendamento));
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> listar(UUID prestadorId, Instant inicio, Instant fim) {
        return agendamentoRepository.listar(prestadorId, inicio, fim)
                .stream()
                .map(AgendamentoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AgendamentoResponse buscarPorId(UUID id, UUID prestadorId) {
        return agendamentoRepository.findByIdAndPrestadorId(id, prestadorId)
                .map(AgendamentoResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento", id.toString()));
    }

    @Transactional
    public AgendamentoResponse atualizar(UUID id, AgendamentoRequest req, UUID prestadorId) {
        Agendamento agendamento = agendamentoRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento", id.toString()));

        if (agendamento.getStatus() == Agendamento.Status.CANCELADO) {
            throw new BusinessException("Agendamento cancelado não pode ser editado.");
        }

        agendamento.setCliente(resolverCliente(req.clienteId(), prestadorId));
        agendamento.setDataHora(req.dataHora());
        agendamento.setDuracaoMin(req.duracaoMin() > 0 ? req.duracaoMin() : 60);
        agendamento.setDescricao(req.descricao());
        agendamento.setAtualizadoEm(Instant.now());

        return AgendamentoResponse.from(agendamentoRepository.save(agendamento));
    }

    @Transactional
    public AgendamentoResponse atualizarStatus(UUID id, String novoStatus, UUID prestadorId) {
        Agendamento agendamento = agendamentoRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento", id.toString()));

        try {
            agendamento.setStatus(Agendamento.Status.valueOf(novoStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status inválido: " + novoStatus);
        }
        agendamento.setAtualizadoEm(Instant.now());
        return AgendamentoResponse.from(agendamentoRepository.save(agendamento));
    }

    private Cliente resolverCliente(UUID clienteId, UUID prestadorId) {
        if (clienteId == null) return null;
        return clienteRepository.findByIdAndPrestadorId(clienteId, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", clienteId.toString()));
    }
}
