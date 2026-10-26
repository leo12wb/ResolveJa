import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { servicoService } from '../../services/servicoService'
import { badgeServico, labelServico } from '../../utils/badges'
import type { Servico, Page, StatusServico } from '../../types'

const STATUS_OPTS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export default function ServicosPage() {
  const navigate = useNavigate()
  const [statusFiltro, setStatusFiltro] = useState('')
  const [pagina, setPagina] = useState(0)
  const [dados, setDados] = useState<Page<Servico> | null>(null)
  const [carregando, setCarregando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await servicoService.listar({ status: statusFiltro || undefined, page: pagina, size: 20 })
      setDados(res)
    } finally { setCarregando(false) }
  }, [statusFiltro, pagina])

  useEffect(() => { setPagina(0) }, [statusFiltro])
  useEffect(() => { carregar() }, [carregar])

  async function handleStatus(id: string, novoStatus: StatusServico) {
    await servicoService.atualizarStatus(id, novoStatus)
    carregar()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
        <Link to="/servicos/novo" className="btn-primary">+ Novo serviço</Link>
      </div>

      {/* Filtros de status */}
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

      {/* Lista */}
      <div className="card p-0 overflow-x-auto">
        {carregando ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : !dados?.content.length ? (
          <div className="p-8 text-center text-gray-400">Nenhum serviço encontrado.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Cliente', 'Descrição', 'Data', 'Valor', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {dados.content.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.clienteNome}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{s.descricao}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{s.dataServico ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {s.valor ? `R$ ${Number(s.valor).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={badgeServico(s.status)}>{labelServico(s.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm flex gap-2 flex-wrap">
                    <button onClick={() => navigate(`/servicos/${s.id}/editar`)} className="text-gray-500 hover:underline">Editar</button>
                    {s.status === 'PENDENTE' && (
                      <button onClick={() => handleStatus(s.id, 'EM_ANDAMENTO')} className="text-blue-600 hover:underline">Iniciar</button>
                    )}
                    {s.status === 'EM_ANDAMENTO' && (
                      <button onClick={() => handleStatus(s.id, 'CONCLUIDO')} className="text-green-600 hover:underline">Concluir</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {dados && dados.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>{dados.totalElements} serviços</span>
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
