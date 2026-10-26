import { useState, useEffect, useCallback, FormEvent } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { despesaService } from '../../services/despesaService'
import type { DespesaRequest } from '../../services/despesaService'
import type { Despesa, ResumoFinanceiro, HistoricoMensal, CategoriaDesp, Page } from '../../types'

const CATEGORIAS: CategoriaDesp[] = ['MATERIAL', 'TRANSPORTE', 'FERRAMENTAS', 'OUTROS']
const CAT_LABEL: Record<CategoriaDesp, string> = {
  MATERIAL: 'Material', TRANSPORTE: 'Transporte', FERRAMENTAS: 'Ferramentas', OUTROS: 'Outros',
}

const TABS = ['Resumo', 'Despesas', 'Evolução'] as const
type Tab = typeof TABS[number]

const EMPTY_FORM: DespesaRequest = {
  descricao: '', valor: 0, categoria: 'OUTROS', dataDespesa: '',
}

function fmtBRL(v: number | undefined | null): string {
  if (v == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function mesLabel(ym: string): string {
  const [ano, mes] = ym.split('-')
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${meses[parseInt(mes) - 1]}/${ano.slice(2)}`
}

interface ModalState { mode: 'create' | 'edit'; despesa?: Despesa }

export default function FinanceiroPage() {
  const now = new Date()
  const [tab, setTab] = useState<Tab>('Resumo')
  const [ano, setAno] = useState(now.getFullYear())
  const [mes, setMes] = useState(now.getMonth() + 1)

  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null)
  const [historico, setHistorico] = useState<HistoricoMensal[]>([])
  const [despesas, setDespesas] = useState<Page<Despesa> | null>(null)
  const [pagina, setPagina] = useState(0)

  const [modal, setModal] = useState<ModalState | null>(null)
  const [form, setForm] = useState<DespesaRequest>(EMPTY_FORM)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(ano, mes, 0).toISOString().slice(0, 10)

  const carregarResumo = useCallback(() => {
    despesaService.resumo({ ano, mes }).then(setResumo)
  }, [ano, mes])

  const carregarDespesas = useCallback(() => {
    despesaService.listar({ inicio: primeiroDia, fim: ultimoDia, page: pagina, size: 15 })
      .then(setDespesas)
  }, [primeiroDia, ultimoDia, pagina])

  useEffect(() => { carregarResumo() }, [carregarResumo])
  useEffect(() => { carregarDespesas() }, [carregarDespesas])
  useEffect(() => { despesaService.historico().then(setHistorico) }, [])
  useEffect(() => { setPagina(0) }, [ano, mes])

  function abrirCriar() {
    setForm({ ...EMPTY_FORM, dataDespesa: primeiroDia })
    setModal({ mode: 'create' })
    setErro('')
  }

  function abrirEditar(d: Despesa) {
    setForm({ descricao: d.descricao, valor: d.valor, categoria: d.categoria, dataDespesa: d.dataDespesa })
    setModal({ mode: 'edit', despesa: d })
    setErro('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(''); setSalvando(true)
    try {
      if (modal?.mode === 'edit' && modal.despesa) {
        await despesaService.atualizar(modal.despesa.id, form)
      } else {
        await despesaService.criar(form)
      }
      setModal(null)
      carregarDespesas()
      carregarResumo()
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao salvar.')
    } finally { setSalvando(false) }
  }

  async function handleExcluir(id: string) {
    await despesaService.excluir(id)
    carregarDespesas()
    carregarResumo()
  }

  const chartData = historico.map((h) => ({
    mes: mesLabel(h.mes),
    Receitas: Number(h.receitas),
    Despesas: Number(h.despesas),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
        <div className="flex items-center gap-2">
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="input-field py-1.5 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          <input
            type="number" min="2020" max="2099"
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="input-field py-1.5 text-sm w-24"
          />
          <button
            onClick={() => despesaService.downloadPdf(ano, mes)}
            className="btn-secondary text-sm py-1.5"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Resumo ── */}
      {tab === 'Resumo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Receitas', value: resumo?.totalReceitas, cor: 'text-green-700' },
              { label: 'Despesas', value: resumo?.totalDespesas, cor: 'text-red-600' },
              { label: 'Resultado Líquido', value: resumo?.resultadoLiquido, cor: 'text-gray-800' },
              { label: 'A Receber', value: resumo?.totalAReceber, cor: 'text-blue-700' },
              { label: 'Ticket Médio', value: resumo?.ticketMedio, cor: 'text-gray-700' },
              { label: 'Serviços Concluídos', value: resumo?.qtdServicosConcluidosMes, cor: 'text-gray-700', isCount: true },
            ].map((kpi) => (
              <div key={kpi.label} className="card">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.cor}`}>
                  {kpi.isCount ? (kpi.value ?? 0) : fmtBRL(kpi.value as number)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Despesas ── */}
      {tab === 'Despesas' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={abrirCriar} className="btn-primary">+ Nova despesa</button>
          </div>

          <div className="card p-0 overflow-x-auto">
            {!despesas?.content.length ? (
              <div className="p-8 text-center text-gray-400">Nenhuma despesa no período.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Descrição', 'Categoria', 'Data', 'Valor', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {despesas.content.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{d.descricao}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{CAT_LABEL[d.categoria]}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{d.dataDespesa}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{fmtBRL(d.valor)}</td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button onClick={() => abrirEditar(d)} className="text-gray-500 hover:underline">Editar</button>
                        <button onClick={() => handleExcluir(d.id)} className="text-red-500 hover:underline">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {despesas && despesas.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                <span>{despesas.totalElements} despesas</span>
                <div className="flex gap-2">
                  <button onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0} className="btn-secondary py-1 px-3 disabled:opacity-40">Anterior</button>
                  <span className="py-1 px-3">{pagina + 1}/{despesas.totalPages}</span>
                  <button onClick={() => setPagina((p) => p + 1)} disabled={pagina >= despesas.totalPages - 1} className="btn-secondary py-1 px-3 disabled:opacity-40">Próxima</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Evolução ── */}
      {tab === 'Evolução' && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Últimos 6 meses</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => fmtBRL(v)} />
              <Legend />
              <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Modal despesa */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {modal.mode === 'create' ? 'Nova despesa' : 'Editar despesa'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{erro}</p>}

              <div>
                <label className="label">Descrição *</label>
                <input required value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Valor (R$) *</label>
                  <input required type="number" min="0.01" step="0.01" value={form.valor || ''} onChange={(e) => setForm((f) => ({ ...f, valor: parseFloat(e.target.value) || 0 }))} className="input-field" />
                </div>
                <div>
                  <label className="label">Data *</label>
                  <input required type="date" value={form.dataDespesa} onChange={(e) => setForm((f) => ({ ...f, dataDespesa: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Categoria *</label>
                <select required value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as CategoriaDesp }))} className="input-field">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={salvando} className="btn-primary flex-1">
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
