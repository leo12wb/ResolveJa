-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger para atualizar atualizado_em automaticamente
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar nas tabelas que têm atualizado_em
CREATE TRIGGER trg_prestador_atualizado_em
    BEFORE UPDATE ON prestador
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_cliente_atualizado_em
    BEFORE UPDATE ON cliente
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_servico_atualizado_em
    BEFORE UPDATE ON servico
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_orcamento_atualizado_em
    BEFORE UPDATE ON orcamento
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_agendamento_atualizado_em
    BEFORE UPDATE ON agendamento
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
