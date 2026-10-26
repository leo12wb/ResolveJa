package io.fixfirst.resolveja.service;

import io.fixfirst.resolveja.dto.cliente.ClienteRequest;
import io.fixfirst.resolveja.dto.cliente.ClienteResponse;
import io.fixfirst.resolveja.exception.ResourceNotFoundException;
import io.fixfirst.resolveja.model.Cliente;
import io.fixfirst.resolveja.model.Prestador;
import io.fixfirst.resolveja.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public ClienteResponse criar(ClienteRequest req, Prestador prestador) {
        Cliente cliente = Cliente.builder()
                .prestador(prestador)
                .nome(req.nome().trim())
                .telefone(req.telefone())
                .email(req.email())
                .endereco(req.endereco())
                .observacoes(req.observacoes())
                .build();
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    @Transactional(readOnly = true)
    public Page<ClienteResponse> listar(UUID prestadorId, String q, Pageable pageable) {
        return clienteRepository.buscar(prestadorId, q, pageable)
                .map(ClienteResponse::from);
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorId(UUID id, UUID prestadorId) {
        return clienteRepository.findByIdAndPrestadorId(id, prestadorId)
                .map(ClienteResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id.toString()));
    }

    @Transactional
    public ClienteResponse atualizar(UUID id, ClienteRequest req, UUID prestadorId) {
        Cliente cliente = clienteRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id.toString()));

        cliente.setNome(req.nome().trim());
        cliente.setTelefone(req.telefone());
        cliente.setEmail(req.email());
        cliente.setEndereco(req.endereco());
        cliente.setObservacoes(req.observacoes());
        cliente.setAtualizadoEm(Instant.now());

        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    @Transactional
    public void desativar(UUID id, UUID prestadorId) {
        Cliente cliente = clienteRepository.findByIdAndPrestadorId(id, prestadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id.toString()));
        cliente.setAtivo(false);
        cliente.setAtualizadoEm(Instant.now());
        clienteRepository.save(cliente);
    }
}
