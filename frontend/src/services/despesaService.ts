import api from './api'
import type { Despesa, Page, ResumoFinanceiro, HistoricoMensal, CategoriaDesp } from '../types'

export interface DespesaRequest {
  servicoId?: string
  descricao: string
  valor: number
  categoria: CategoriaDesp
  dataDespesa: string   // "YYYY-MM-DD"
}

export const despesaService = {
  listar: (params?: { inicio?: string; fim?: string; page?: number; size?: number }) =>
    api.get<Page<Despesa>>('/despesas', { params }).then((r) => r.data),

  criar: (data: DespesaRequest) =>
    api.post<Despesa>('/despesas', data).then((r) => r.data),

  atualizar: (id: string, data: DespesaRequest) =>
    api.put<Despesa>(`/despesas/${id}`, data).then((r) => r.data),

  excluir: (id: string) =>
    api.delete(`/despesas/${id}`),

  resumo: (params?: { ano?: number; mes?: number }) =>
    api.get<ResumoFinanceiro>('/financeiro/resumo', { params }).then((r) => r.data),

  historico: () =>
    api.get<HistoricoMensal[]>('/financeiro/historico').then((r) => r.data),

  downloadPdf: async (ano: number, mes: number) => {
    const res = await api.get('/financeiro/relatorio/pdf', {
      params: { ano, mes },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${ano}-${String(mes).padStart(2, '0')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },
}
