package io.fixfirst.resolveja.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "despesa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Despesa {

    public enum Categoria { MATERIAL, TRANSPORTE, FERRAMENTAS, OUTROS }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prestador_id", nullable = false)
    private Prestador prestador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @Column(nullable = false, length = 255)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private Categoria categoria = Categoria.OUTROS;

    @Column(name = "data_despesa", nullable = false)
    private LocalDate dataDespesa;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @Builder.Default
    private Instant criadoEm = Instant.now();
}
