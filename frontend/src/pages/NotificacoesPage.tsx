import { useState, useEffect, useCallback } from 'react'
import { notificacaoService } from '../services/notificacaoService'
import type { Notificacao, Page } from '../types'

const TIPO_LABEL: Record<string, string> = {
  ORCAMENTO_APROVADO: 'Orçamento aprovado',
  ORCAMENTO_RECUSADO: 'Orçamento recusado',
  SERVICO_CONCLUIDO: 'Serviço concluído',
  AGENDAMENTO: 'Agendamento',
  SISTEMA: 'Sistema',
}

const TIPO_COR: Record<string, string> = {
  ORCAMENTO_APROVADO: 'bg-green-100 text-green-700',
  ORCAMENTO_RECUSADO: 'bg-red-100 text-red-600',
  SERVICO_CONCLUIDO: 'bg-blue-100 text-blue-700',
  AGENDAMENTO: 'bg-purple-100 text-purple-700',
  SISTEMA: 'bg-gray-100 text-gray-600',
}

export default function NotificacoesPage() {
  const [dados, setDados] = useState<Page<Notificacao> | null>(null)
  const [pagina, setPagina] = useState(0)
  const [carregando, setCarregando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await notificacaoService.listar({ page: pagina, size: 20 })
      setDados(res)
    } finally { setCarregando(false) }
  }, [pagina])

  useEffect(() => { carregar() }, [carregar])

  async function handleMarcarLida(id: string) {
    await notificacaoService.marcarLida(id)
    setDados((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((n) =>
              n.id === id ? { ...n, lida: true } : n
            ),
          }
        : prev
    )
  }

  async function handleMarcarTodas() {
    await notificacaoService.marcarTodasLidas()
    setDados((prev) =>
      prev
        ? { ...prev, content: prev.content.map((n) => ({ ...n, lida: true })) }
        : prev
    )
  }

  const naoLidas = dados?.content.filter((n) => !n.lida).length ?? 0

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
          {naoLidas > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{naoLidas} não lida(s)</p>
          )}
        </div>
        {naoLidas > 0 && (
          <button onClick={handleMarcarTodas} className="btn-secondary text-sm py-1.5">
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="card p-0">
        {carregando ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : !dados?.content.length ? (
          <div className="p-8 text-center text-gray-400">Nenhuma notificação.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {dados.content.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  n.lida ? 'bg-white' : 'bg-primary-50/40'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COR[n.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
                      {TIPO_LABEL[n.tipo] ?? n.tipo}
                    </span>
                    {!n.lida && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(n.criadoEm).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{n.mensagem}</p>
                </div>
                {!n.lida && (
                  <button
                    onClick={() => handleMarcarLida(n.id)}
                    className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 mt-0.5"
                    title="Marcar como lida"
                  >
                    ✓
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {dados && dados.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>{dados.totalElements} notificações</span>
            <div className="flex gap-2">
              <button onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0} className="btn-secondary py-1 px-3 disabled:opacity-40">Anterior</button>
              <span className="py-1 px-3">{pagina + 1}/{dados.totalPages}</span>
              <button onClick={() => setPagina((p) => p + 1)} disabled={pagina >= dados.totalPages - 1} className="btn-secondary py-1 px-3 disabled:opacity-40">Próxima</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
