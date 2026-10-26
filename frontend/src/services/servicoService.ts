import api from './api'
import type { Servico, Page, StatusServico } from '../types'

export interface ServicoRequest {
  clienteId: string
  descricao: string
  status?: StatusServico
  valor?: number
  pago?: boolean
  dataServico?: string
  observacoes?: string
}

export const servicoService = {
  listar: (params?: { status?: string; clienteId?: string; inicio?: string; fim?: string; page?: number; size?: number }) =>
    api.get<Page<Servico>>('/servicos', { params }).then((r) => r.data),

  buscar: (id: string) =>
    api.get<Servico>(`/servicos/${id}`).then((r) => r.data),

  criar: (data: ServicoRequest) =>
    api.post<Servico>('/servicos', data).then((r) => r.data),

  atualizar: (id: string, data: ServicoRequest) =>
    api.put<Servico>(`/servicos/${id}`, data).then((r) => r.data),

  atualizarStatus: (id: string, status: StatusServico) =>
    api.patch<Servico>(`/servicos/${id}/status`, { status }).then((r) => r.data),
}
