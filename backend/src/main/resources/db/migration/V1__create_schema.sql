-- ─────────────────────────────────────────────────────────────────────────────
-- ResolveJá — Schema inicial
-- V1__create_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Prestador ────────────────────────────────────────────────────────────────
CREATE TABLE prestador (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                 VARCHAR(150) NOT NULL,
    email                VARCHAR(255) NOT NULL UNIQUE,
    senha_hash           VARCHAR(255) NOT NULL,
    ativo                BOOLEAN     NOT NULL DEFAULT TRUE,
    consentimento_lgpd   BOOLEAN     NOT NULL DEFAULT FALSE,
    consentimento_data   TIMESTAMPTZ,
    criado_em            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Cliente ──────────────────────────────────────────────────────────────────
CREATE TABLE cliente (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id  UUID        NOT NULL REFERENCES prestador(id),
    nome          VARCHAR(150) NOT NULL,
    telefone      VARCHAR(20),
    email         VARCHAR(255),
    endereco      TEXT,
    observacoes   TEXT,
    ativo         BOOLEAN     NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Serviço ──────────────────────────────────────────────────────────────────
CREATE TABLE servico (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id    UUID         NOT NULL REFERENCES prestador(id),
    cliente_id      UUID         NOT NULL REFERENCES cliente(id),
    descricao       TEXT         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE'
                        CHECK (status IN ('PENDENTE','EM_ANDAMENTO','CONCLUIDO','CANCELADO')),
    valor           NUMERIC(10,2),
    pago            BOOLEAN      NOT NULL DEFAULT FALSE,
    data_servico    DATE,
    data_conclusao  TIMESTAMPTZ,
    observacoes     TEXT,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Orçamento ────────────────────────────────────────────────────────────────
CREATE TABLE orcamento (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id    UUID        NOT NULL REFERENCES prestador(id),
    cliente_id      UUID        REFERENCES cliente(id),
    token_publico   VARCHAR(12) NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO'
                        CHECK (status IN ('RASCUNHO','ENVIADO','APROVADO','RECUSADO','EXPIRADO')),
    validade_dias   INT         NOT NULL DEFAULT 7,
    validade_data   DATE        NOT NULL,
    total           NUMERIC(10,2),
    observacoes     TEXT,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Item de Orçamento ────────────────────────────────────────────────────────
CREATE TABLE orcamento_item (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id  UUID         NOT NULL REFERENCES orcamento(id) ON DELETE CASCADE,
    descricao     VARCHAR(255) NOT NULL,
    quantidade    NUMERIC(8,2) NOT NULL DEFAULT 1,
    valor_unit    NUMERIC(10,2) NOT NULL
);

-- ─── Agendamento ──────────────────────────────────────────────────────────────
CREATE TABLE agendamento (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id  UUID        NOT NULL REFERENCES prestador(id),
    cliente_id    UUID        REFERENCES cliente(id),
    data_hora     TIMESTAMPTZ NOT NULL,
    duracao_min   INT         NOT NULL DEFAULT 60,
    descricao     TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'AGENDADO'
                      CHECK (status IN ('AGENDADO','REALIZADO','CANCELADO')),
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Despesa ──────────────────────────────────────────────────────────────────
CREATE TABLE despesa (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id  UUID         NOT NULL REFERENCES prestador(id),
    servico_id    UUID         REFERENCES servico(id) ON DELETE SET NULL,
    descricao     VARCHAR(255) NOT NULL,
    valor         NUMERIC(10,2) NOT NULL,
    categoria     VARCHAR(30)  NOT NULL DEFAULT 'OUTROS'
                      CHECK (categoria IN ('MATERIAL','TRANSPORTE','FERRAMENTAS','OUTROS')),
    data_despesa  DATE         NOT NULL,
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Notificação ──────────────────────────────────────────────────────────────
CREATE TABLE notificacao (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id   UUID        NOT NULL REFERENCES prestador(id),
    tipo           VARCHAR(50) NOT NULL,
    mensagem       TEXT        NOT NULL,
    lida           BOOLEAN     NOT NULL DEFAULT FALSE,
    entidade_tipo  VARCHAR(50),
    entidade_id    UUID,
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Log de Acesso (LGPD — Art. 15 Marco Civil) ───────────────────────────────
CREATE TABLE log_acesso (
    id            BIGSERIAL    PRIMARY KEY,
    prestador_id  UUID         REFERENCES prestador(id) ON DELETE SET NULL,
    ip            VARCHAR(45)  NOT NULL,
    user_agent    VARCHAR(500),
    acao          VARCHAR(100),
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Token de Recuperação de Senha ────────────────────────────────────────────
CREATE TABLE token_recuperacao (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prestador_id  UUID        NOT NULL REFERENCES prestador(id) ON DELETE CASCADE,
    token         VARCHAR(64) NOT NULL UNIQUE,
    expira_em     TIMESTAMPTZ NOT NULL,
    usado         BOOLEAN     NOT NULL DEFAULT FALSE,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────────────────────

-- cliente
CREATE INDEX idx_cliente_prestador    ON cliente(prestador_id);
CREATE INDEX idx_cliente_nome         ON cliente(prestador_id, nome);
CREATE INDEX idx_cliente_ativo        ON cliente(prestador_id, ativo);

-- servico
CREATE INDEX idx_servico_prestador    ON servico(prestador_id);
CREATE INDEX idx_servico_cliente      ON servico(cliente_id);
CREATE INDEX idx_servico_status       ON servico(prestador_id, status);
CREATE INDEX idx_servico_data         ON servico(prestador_id, data_servico);

-- orcamento
CREATE INDEX idx_orcamento_prestador  ON orcamento(prestador_id);
CREATE INDEX idx_orcamento_token      ON orcamento(token_publico);
CREATE INDEX idx_orcamento_status     ON orcamento(prestador_id, status);
CREATE INDEX idx_orcamento_validade   ON orcamento(validade_data) WHERE status = 'ENVIADO';

-- agendamento
CREATE INDEX idx_agendamento_prestador ON agendamento(prestador_id);
CREATE INDEX idx_agendamento_data      ON agendamento(prestador_id, data_hora);
CREATE INDEX idx_agendamento_status    ON agendamento(prestador_id, status);

-- despesa
CREATE INDEX idx_despesa_prestador    ON despesa(prestador_id);
CREATE INDEX idx_despesa_data         ON despesa(prestador_id, data_despesa);

-- notificacao
CREATE INDEX idx_notificacao_prestador ON notificacao(prestador_id, lida);
CREATE INDEX idx_notificacao_criado    ON notificacao(prestador_id, criado_em DESC);

-- log_acesso
CREATE INDEX idx_log_acesso_prestador  ON log_acesso(prestador_id);
CREATE INDEX idx_log_acesso_criado     ON log_acesso(criado_em);

-- token_recuperacao
CREATE INDEX idx_token_rec_token       ON token_recuperacao(token);
CREATE INDEX idx_token_rec_prestador   ON token_recuperacao(prestador_id);
