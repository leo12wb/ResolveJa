// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  senha: string
}

export interface AuthResponse {
  token: string
  prestador: {
    id: string
    nome: string
    email: string
  }
}

// ─── Cliente ──────────────────────────────────────────────────────────────────

export interface Cliente {
  id: string
  nome: string
  telefone?: string
  email?: string
  endereco?: string
  observacoes?: string
  ativo: boolean
  criadoEm: string
}

// ─── Serviço ──────────────────────────────────────────────────────────────────

export type StatusServico = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'

export interface Servico {
  id: string
  clienteId: string
  clienteNome: string
  descricao: string
  status: StatusServico
  valor?: number
  pago: boolean
  dataServico?: string
  dataConclusao?: string
  observacoes?: string
  criadoEm: string
}

// ─── Orçamento ────────────────────────────────────────────────────────────────

export type StatusOrcamento = 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO'

export interface OrcamentoItem {
  id?: string
  descricao: string
  quantidade: number
  valorUnit: number
}

export interface Orcamento {
  id: string
  clienteId?: string
  clienteNome?: string
  tokenPublico: string
  status: StatusOrcamento
  validadeDias: number
  validadeData: string
  total: number
  observacoes?: string
  itens: OrcamentoItem[]
  criadoEm: string
}

// ─── Agendamento ──────────────────────────────────────────────────────────────

export type StatusAgendamento = 'AGENDADO' | 'REALIZADO' | 'CANCELADO'

export interface Agendamento {
  id: string
  clienteId?: string
  clienteNome?: string
  dataHora: string
  duracaoMin: number
  descricao?: string
  status: StatusAgendamento
  criadoEm: string
}

// ─── Financeiro ───────────────────────────────────────────────────────────────

export type CategoriaDesp = 'MATERIAL' | 'TRANSPORTE' | 'FERRAMENTAS' | 'OUTROS'

export interface Despesa {
  id: string
  servicoId?: string
  descricao: string
  valor: number
  categoria: CategoriaDesp
  dataDespesa: string
  criadoEm: string
}

export interface ResumoFinanceiro {
  totalReceitas: number
  totalDespesas: number
  resultadoLiquido: number
  totalAReceber: number
  ticketMedio: number
  qtdServicosConcluidosMes: number
}

export interface HistoricoMensal {
  mes: string
  receitas: number
  despesas: number
}

// ─── Notificação ──────────────────────────────────────────────────────────────

export interface Notificacao {
  id: string
  tipo: string
  mensagem: string
  lida: boolean
  entidadeTipo?: string
  entidadeId?: string
  criadoEm: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  proximosAgendamentos: Agendamento[]
  orcamentosAguardando: number
  servicosEmAndamento: number
  resumoMes: ResumoFinanceiro
  totalClientesAtivos: number
  alertas: string[]
}

// ─── Paginação ────────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
