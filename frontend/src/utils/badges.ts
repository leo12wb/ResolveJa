import type { StatusServico, StatusOrcamento, StatusAgendamento } from '../types'

export function badgeServico(status: StatusServico): string {
  const map: Record<StatusServico, string> = {
    PENDENTE:     'badge-status bg-yellow-100 text-yellow-700',
    EM_ANDAMENTO: 'badge-status bg-blue-100 text-blue-700',
    CONCLUIDO:    'badge-status bg-green-100 text-green-700',
    CANCELADO:    'badge-status bg-gray-100 text-gray-500',
  }
  return map[status] ?? 'badge-status bg-gray-100 text-gray-500'
}

export function labelServico(status: StatusServico): string {
  const map: Record<StatusServico, string> = {
    PENDENTE: 'Pendente', EM_ANDAMENTO: 'Em andamento',
    CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado',
  }
  return map[status] ?? status
}

export function badgeOrcamento(status: StatusOrcamento): string {
  const map: Record<StatusOrcamento, string> = {
    RASCUNHO: 'badge-status bg-gray-100 text-gray-500',
    ENVIADO:  'badge-status bg-blue-100 text-blue-700',
    APROVADO: 'badge-status bg-green-100 text-green-700',
    RECUSADO: 'badge-status bg-red-100 text-red-600',
    EXPIRADO: 'badge-status bg-orange-100 text-orange-600',
  }
  return map[status] ?? 'badge-status bg-gray-100 text-gray-500'
}

export function labelOrcamento(status: StatusOrcamento): string {
  const map: Record<StatusOrcamento, string> = {
    RASCUNHO: 'Rascunho', ENVIADO: 'Enviado', APROVADO: 'Aprovado',
    RECUSADO: 'Recusado', EXPIRADO: 'Expirado',
  }
  return map[status] ?? status
}

export function badgeAgendamento(status: StatusAgendamento): string {
  const map: Record<StatusAgendamento, string> = {
    AGENDADO:  'badge-status bg-blue-100 text-blue-700',
    REALIZADO: 'badge-status bg-green-100 text-green-700',
    CANCELADO: 'badge-status bg-gray-100 text-gray-500',
  }
  return map[status] ?? 'badge-status bg-gray-100 text-gray-500'
}
