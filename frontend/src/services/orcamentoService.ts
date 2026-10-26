import api from './api'
import type { Orcamento, Page, StatusOrcamento } from '../types'

export interface OrcamentoItemRequest {
  descricao: string
  quantidade: number
  valorUnit: number
}

export interface OrcamentoRequest {
  clienteId?: string
  validadeDias: number
  observacoes?: string
  itens: OrcamentoItemRequest[]
}

export const orcamentoService = {
  listar: (params?: { status?: string; page?: number; size?: number }) =>
    api.get<Page<Orcamento>>('/orcamentos', { params }).then((r) => r.data),

  buscar: (id: string) =>
    api.get<Orcamento>(`/orcamentos/${id}`).then((r) => r.data),

  criar: (data: OrcamentoRequest) =>
    api.post<Orcamento>('/orcamentos', data).then((r) => r.data),

  atualizar: (id: string, data: OrcamentoRequest) =>
    api.put<Orcamento>(`/orcamentos/${id}`, data).then((r) => r.data),

  atualizarStatus: (id: string, status: StatusOrcamento) =>
    api.patch<Orcamento>(`/orcamentos/${id}/status`, { status }).then((r) => r.data),

  // Público — sem autenticação
  buscarPublico: (token: string) =>
    api.get<Orcamento>(`/orcamento/public/${token}`).then((r) => r.data),

  aprovar: (token: string) =>
    api.post<Orcamento>(`/orcamento/public/${token}/aprovar`).then((r) => r.data),

  recusar: (token: string) =>
    api.post<Orcamento>(`/orcamento/public/${token}/recusar`).then((r) => r.data),
}
