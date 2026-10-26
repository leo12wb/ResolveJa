import api from './api'
import type { Notificacao, Page } from '../types'

export const notificacaoService = {
  listar: (params?: { page?: number; size?: number }) =>
    api.get<Page<Notificacao>>('/notificacoes', { params }).then((r) => r.data),

  countNaoLidas: () =>
    api.get<{ naoLidas: number }>('/notificacoes/count').then((r) => r.data.naoLidas),

  marcarLida: (id: string) =>
    api.patch<Notificacao>(`/notificacoes/${id}/lida`).then((r) => r.data),

  marcarTodasLidas: () =>
    api.patch('/notificacoes/marcar-todas-lidas'),
}
