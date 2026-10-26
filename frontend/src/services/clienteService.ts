import api from './api'
import type { Cliente, Page } from '../types'

export interface ClienteRequest {
  nome: string
  telefone?: string
  email?: string
  endereco?: string
  observacoes?: string
}

export const clienteService = {
  listar: (params?: { q?: string; page?: number; size?: number }) =>
    api.get<Page<Cliente>>('/clientes', { params }).then((r) => r.data),

  buscar: (id: string) =>
    api.get<Cliente>(`/clientes/${id}`).then((r) => r.data),

  criar: (data: ClienteRequest) =>
    api.post<Cliente>('/clientes', data).then((r) => r.data),

  atualizar: (id: string, data: ClienteRequest) =>
    api.put<Cliente>(`/clientes/${id}`, data).then((r) => r.data),

  desativar: (id: string) =>
    api.delete(`/clientes/${id}`),
}
