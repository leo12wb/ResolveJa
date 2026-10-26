import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { orcamentoService } from '../../services/orcamentoService'
import type { Orcamento } from '../../types'

const STATUS_MSG: Record<string, { title: string; desc: string; cor: string }> = {
  APROVADO: { title: 'Orçamento aprovado', desc: 'Você aprovou este orçamento. Entraremos em contato em breve.', cor: 'text-green-700' },
  RECUSADO: { title: 'Orçamento recusado', desc: 'Você recusou este orçamento.', cor: 'text-gray-500' },
  EXPIRADO: { title: 'Orçamento expirado', desc: 'O prazo de validade deste orçamento encerrou.', cor: 'text-orange-600' },
  RASCUNHO: { title: 'Link inválido', desc: 'Este orçamento ainda não foi enviado.', cor: 'text-gray-500' },
}

export default function OrcamentoPublicoPage() {
  const { token } = useParams<{ token: string }>()
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [erro, setErro] = useState('')
  const [respondido, setRespondido] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [acao, setAcao] = useState<'aprovar' | 'recusar' | null>(null)

  useEffect(() => {
    if (!token) return
    orcamentoService.buscarPublico(token)
      .then(setOrcamento)
      .catch(() => setErro('Orçamento não encontrado.'))
      .finally(() => setCarregando(false))
  }, [token])

  async function handleResposta(aprovar: boolean) {
    if (!token) return
    setAcao(aprovar ? 'aprovar' : 'recusar')
    try {
      const updated = await orcamentoService[aprovar ? 'aprovar' : 'recusar'](token)
      setOrcamento(updated)
      setRespondido(true)
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao processar resposta.')
    } finally { setAcao(null) }
  }

  const isExpired = orcamento ? new Date(orcamento.validadeData) < new Date() : false

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Cabeçalho da empresa */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-700">ResolveJá</h1>
          <p className="text-sm text-gray-500 mt-1">Orçamento profissional</p>
        </div>

        {carregando && (
          <div className="card text-center text-gray-400 py-12">Carregando orçamento...</div>
        )}

        {erro && !orcamento && (
          <div className="card text-center py-12">
            <p className="text-gray-500">{erro}</p>
          </div>
        )}

        {orcamento && (() => {
          const msg = STATUS_MSG[orcamento.status]
          const podeResponder = orcamento.status === 'ENVIADO' && !isExpired && !respondido

          return (
            <>
              {/* Status não-pendente */}
              {!podeResponder && msg && (
                <div className="card text-center py-8">
                  <p className={`text-lg font-semibold ${msg.cor}`}>{msg.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{msg.desc}</p>
                </div>
              )}

              {/* Detalhes */}
              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    {orcamento.clienteNome && (
                      <p className="text-sm text-gray-500">Para: <span className="font-medium text-gray-800">{orcamento.clienteNome}</span></p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Válido até {orcamento.validadeData}</p>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">Descrição</th>
                      <th className="pb-2 font-medium text-right">Qtd</th>
                      <th className="pb-2 font-medium text-right">Unit.</th>
                      <th className="pb-2 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orcamento.itens.map((item, idx) => (
                      <tr key={item.id ?? idx}>
                        <td className="py-2 text-gray-800">{item.descricao}</td>
                        <td className="py-2 text-right text-gray-600">{item.quantidade}</td>
                        <td className="py-2 text-right text-gray-600">R$ {Number(item.valorUnit).toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">
                          R$ {(Number(item.quantidade) * Number(item.valorUnit)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="pt-2 text-right font-semibold text-gray-700">Total</td>
                      <td className="pt-2 text-right font-bold text-lg text-gray-900">R$ {Number(orcamento.total).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>

                {orcamento.observacoes && (
                  <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{orcamento.observacoes}</p>
                )}

                {/* Botões de resposta */}
                {podeResponder && (
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    {erro && <p className="text-sm text-red-600 w-full">{erro}</p>}
                    <button
                      onClick={() => handleResposta(true)}
                      disabled={acao !== null}
                      className="btn-primary flex-1"
                    >
                      {acao === 'aprovar' ? 'Aprovando...' : 'Aprovar orçamento'}
                    </button>
                    <button
                      onClick={() => handleResposta(false)}
                      disabled={acao !== null}
                      className="btn-secondary flex-1"
                    >
                      {acao === 'recusar' ? 'Recusando...' : 'Recusar'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )
        })()}

        <p className="text-center text-xs text-gray-400">
          Powered by <span className="font-semibold text-primary-600">ResolveJá</span>
        </p>
      </div>
    </div>
  )
}
