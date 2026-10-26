import api from './api'
import type { Agendamento, StatusAgendamento } from '../types'

export interface AgendamentoRequest {
  clienteId?: string
  dataHora: string       // ISO 8601 UTC
  duracaoMin: number
  descricao?: string
}

export const agendamentoService = {
  listar: (params?: { inicio?: string; fim?: string }) =>
    api.get<Agendamento[]>('/agendamentos', { params }).then((r) => r.data),

  buscar: (id: string) =>
    api.get<Agendamento>(`/agendamentos/${id}`).then((r) => r.data),

  criar: (data: AgendamentoRequest) =>
    api.post<Agendamento>('/agendamentos', data).then((r) => r.data),

  atualizar: (id: string, data: AgendamentoRequest) =>
    api.put<Agendamento>(`/agendamentos/${id}`, data).then((r) => r.data),

  atualizarStatus: (id: string, status: StatusAgendamento) =>
    api.patch<Agendamento>(`/agendamentos/${id}/status`, { status }).then((r) => r.data),
}
