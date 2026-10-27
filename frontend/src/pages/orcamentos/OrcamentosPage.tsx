import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { orcamentoService } from '../../services/orcamentoService'
import { badgeOrcamento, labelOrcamento } from '../../utils/badges'
import type { Orcamento, Page } from '../../types'

const STATUS_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'RECUSADO', label: 'Recusado' },
  { value: 'EXPIRADO', label: 'Expirado' },
]

export default function OrcamentosPage() {
  const navigate = useNavigate()
  const [statusFiltro, setStatusFiltro] = useState('')
  const [pagina, setPagina] = useState(0)
  const [dados, setDados] = useState<Page<Orcamento> | null>(null)
  const [carregando, setCarregando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await orcamentoService.listar({ status: statusFiltro || undefined, page: pagina, size: 20 })
      setDados(res)
    } finally { setCarregando(false) }
  }, [statusFiltro, pagina])

  useEffect(() => { setPagina(0) }, [statusFiltro])
  useEffect(() => { carregar() }, [carregar])

  async function handleEnviar(id: string) {
    await orcamentoService.atualizarStatus(id, 'ENVIADO')
    carregar()
  }

  function linkPublico(token: string) {
    return `${window.location.origin}/orcamento/${token}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Orçamentos</h1>
        <Link to="/orcamentos/novo" className="btn-primary">+ Novo orçamento</Link>
      </div>

      <div className="card flex flex-wrap gap-2">
        {STATUS_OPTS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFiltro(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFiltro === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-x-auto">
        {carregando ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : !dados?.content.length ? (
          <div className="p-8 text-center text-gray-400">Nenhum orçamento encontrado.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Cliente', 'Válido até', 'Total', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {dados.content.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{o.clienteNome ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{o.validadeData}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {o.total != null ? `R$ ${Number(o.total).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={badgeOrcamento(o.status)}>{labelOrcamento(o.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm flex gap-2 flex-wrap">
                    <button onClick={() => navigate(`/orcamentos/${o.id}`)} className="text-gray-500 hover:underline">Ver</button>
                    {o.status === 'RASCUNHO' && (
                      <button onClick={() => navigate(`/orcamentos/${o.id}/editar`)} className="text-gray-500 hover:underline">Editar</button>
                    )}
                    {o.status === 'RASCUNHO' && (
                      <button onClick={() => handleEnviar(o.id)} className="text-blue-600 hover:underline">Enviar</button>
                    )}
                    {o.status === 'ENVIADO' && (
                      <a
                        href={linkPublico(o.tokenPublico)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        Link
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {dados && dados.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>{dados.totalElements} orçamentos</span>
            <div className="flex gap-2">
              <button onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0} className="btn-secondary py-1 px-3 disabled:opacity-40">Anterior</button>
              <span className="py-1 px-3">{pagina + 1} / {dados.totalPages}</span>
              <button onClick={() => setPagina((p) => p + 1)} disabled={pagina >= dados.totalPages - 1} className="btn-secondary py-1 px-3 disabled:opacity-40">Próxima</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
